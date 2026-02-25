<script lang="ts">
	import { defaultExpenses, type Expense, type Profile, type Group } from '$lib';
	import ExpenseList from '$lib/components/ExpenseList.svelte';
	import Info from '$lib/components/Info.svelte';
	import SignIn from '$lib/components/SignIn.svelte';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import { authStore } from '$lib/stores/auth';

	import { db } from '$lib/firebase';
	import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
	import type { PageProps } from './$types';
	import { ArrowLeft } from '@lucide/svelte';

	let { params }: PageProps = $props();

	let currentDate = $state(new Date());
	let expenses: Expense[] = $state([]);

	let noScroll = $state(false);

	let user = $derived($authStore.user);
	let profile: Profile | null = $state(null);
	let group: Group | null = $state(null);

	const getOrCreateProfile = async () => {
		if (!user) return;
		const docRef = doc(db, 'profiles', user.uid);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			profile = docSnap.data() as Profile;
			$state.snapshot(profile);
		} else {
			let newProfile: Profile = {
				monthlyBudget: 2000,
				expenses: [],
				groups: []
			};
			await setDoc(docRef, newProfile);
			profile = newProfile;
		}
	};

	const getGroupDetails = async (groupId: string) => {
		const docRef = doc(db, 'groups', groupId);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			group = docSnap.data() as Group;
		} else {
			// Handle case where group doesn't exist, e.g., redirect or show error
			console.error('Group not found!');
			group = null;
		}
	};

	const getExpensesForGroup = async (groupId: string) => {
		if (!user) return;
		const date = new Date(currentDate);
		const year = date.getFullYear();
		const month = date.getMonth();

		const expensesCol = collection(db, 'expenses');
		const q = query(
			expensesCol,
			where('profileId', '==', user.uid),
			where('groupId', '==', groupId)
		);
		const querySnapshot = await getDocs(q);
		expenses = querySnapshot.docs.map((doc) => {
			const data = doc.data() as Expense;
			return data;
		});
	};

	const addExpenses = async (newExpenses: Expense[]) => {
		if (!user || !profile || !group) return;

		for (const expense of newExpenses) {
			const expenseWithProfileId = { ...expense, profileId: user.uid, groupId: group.id };
			const docRef = doc(collection(db, 'expenses')); // Auto-generate ID
			await setDoc(docRef, expenseWithProfileId);
		}
		getExpensesForGroup(group.id); // Refresh expenses for the group
	};

	$effect(() => {
		if (user) {
			getOrCreateProfile();
		}
	});

	$effect(() => {
		const groupId = params.id;
		if (user && groupId) {
			getGroupDetails(groupId);
			getExpensesForGroup(groupId);
		}
	});
</script>

<main class="container" class:no-scroll={noScroll}>
	{#if user && profile && group}
		<UserAvatar {user} />
		<h2 class="group-name">{group.name}</h2>
		<Info {currentDate} bind:expenses budget={group.budget} isGroup={true} groupName={group.name} />
		<ExpenseList
			bind:noScroll
			bind:expenses
			{profile}
			{user}
			groupId={group.id}
			groupName={group.name}
		/>
	{:else if user && profile && !group}
		<p>Loading group details or group not found...</p>
	{:else}
		<SignIn />
	{/if}
</main>
<a href="/profile" class="back-btn">
	<ArrowLeft size={24} />
</a>

<style>
	.container {
		max-width: 800px;
		margin: auto;
		padding: 0 1rem;
		padding-top: 2rem;
		margin-top: 4rem;
		color: var(--text-color);
	}

	.container.no-scroll {
		max-height: 100vh;
		overflow: hidden;
	}

	.back-btn {
		position: fixed;
		top: 2rem;
		left: 2rem;
		background: none;
		outline: none;
		border: none;
		display: flex;
		align-items: center;

		color: var(--subtle-text-color);
		font-size: 1.2rem;
		font-weight: bold;
		cursor: pointer;
		text-decoration: none;
		z-index: 100;
	}

	.back-btn:hover {
		color: var(--text-color);
	}

	.group-name {
		margin-bottom: 1rem;
		font-size: 2rem;
		text-align: center;
	}
</style>
