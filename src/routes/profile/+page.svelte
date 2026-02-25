<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { db } from '$lib/firebase';
	import {
		collection,
		query,
		where,
		getDocs,
		doc,
		getDoc,
		updateDoc,
		writeBatch,
		arrayUnion
	} from 'firebase/firestore';
	import type { Expense, Profile, Group } from '$lib';

	import ProfileCard from '$lib/components/ProfileCard.svelte';
	import LoadingSpinner from '$lib/components/misc/LoadingSpinner.svelte';
	import MonthRangeSelection from '$lib/components/inputs/MonthRangeSelection.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import MonthlyExpenseComparison from '$lib/components/MonthlyExpenseComparison.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import GroupsList from '$lib/components/GroupsList.svelte';

	let user = $derived($authStore.user);
	let profile: Profile | null = $state(null);
	let expenses: Expense[] = $state([]);
	let groups: Group[] = $state([]);
	let loading = $state(true);

	let startDate: Date = $state(new Date());
	let endDate: Date = $state(new Date());

	onMount(() => {
		let now = new Date();
		startDate.setMonth(now.getMonth() - 11);
		startDate.setDate(1);
	});

	let monthSelectionOpen = $state(false);

	const getMonthDiff = (start: Date, end: Date) => {
		return end.getMonth() - start.getMonth() + 12 * (end.getFullYear() - start.getFullYear());
	};

	const handleRangeApply = (
		start: { year: number; month: number },
		end: { year: number; month: number }
	) => {
		startDate = new Date(start.year, start.month, 1);
		// Setting the date and time in this way makes it go back to the end of the prev month
		endDate = new Date(end.year, end.month + 1, 0, 23, 59, 59);
	};

	const fetchProfile = async (uid: string) => {
		const docRef = doc(db, 'profiles', uid);
		const docSnap = await getDoc(docRef);
		if (docSnap.exists()) {
			profile = docSnap.data() as Profile;
		}
	};

	const fetchExpenses = async (uid: string, start: Date, end: Date) => {
		const monthDiff = getMonthDiff(start, end);

		const expensesCol = collection(db, 'expenses');
		const q = query(
			expensesCol,
			where('profileId', '==', uid),
			where('groupId', '==', null), // Replace 'someGroupId' with the actual group ID
			where('timestamp', '>=', start),
			where('timestamp', '<=', end)
		);
		const querySnapshot = await getDocs(q);
		expenses = querySnapshot.docs.map((doc) => {
			const data = doc.data() as Expense;
			return data;
		});
	};

	const updateProfile = async (newBudget: number) => {
		if (!user) return;
		const docRef = doc(db, 'profiles', user.uid);
		await updateDoc(docRef, { monthlyBudget: newBudget });
	};

	$effect(() => {
		if (user) {
			fetchProfile(user.uid).then(() => (loading = false));
		} else if (!$authStore.loading && !user) {
			goto('/');
		}
	});

	$effect(() => {
		if (user) fetchExpenses(user.uid, startDate, endDate);
	});

	const fetchGroups = async (profileId: string) => {
		const groupsCol = collection(db, 'groups');
		const q = query(groupsCol, where('profileId', '==', profileId));
		const querySnapshot = await getDocs(q);
		groups = querySnapshot.docs.map((doc) => {
			return { id: doc.id, ...doc.data() } as Group;
		});
	};

	const addNewGroup = async (newGroup: Group) => {
		if (!user) return;

		const batch = writeBatch(db);
		const newGroupRef = doc(collection(db, 'groups'));
		const id = newGroupRef.id;

		const groupData: Group = {
			...newGroup,
			id: id,
			profileId: user.uid
		};

		batch.set(newGroupRef, groupData);

		const profileRef = doc(db, 'profiles', user.uid);
		batch.update(profileRef, {
			groups: arrayUnion(id)
		});

		await batch.commit();

		groups = [...groups, groupData];
	};

	$effect(() => {
		if (user) fetchGroups(user.uid);
	});
</script>

<div class="container">
	{#if user && profile && !loading}
		<ProfileCard {user} bind:profile onUpdate={updateProfile} />
		<h2>Monthly Expense Comparison</h2>
		<div class="range-selection">
			<MonthRangeSelection onApply={handleRangeApply} {startDate} {endDate} />
		</div>
		<div class="chart-container">
			<MonthlyExpenseComparison {expenses} {startDate} {endDate} />
		</div>

		<GroupsList {groups} {user} {addNewGroup} />
	{:else}
		<LoadingSpinner msg="Getting profile..." />
	{/if}
	<a href="/" class="back-btn">
		<ArrowLeft size={24} />
	</a>
</div>

<style>
	h2 {
		margin-top: 1rem;
	}
	.container {
		max-width: 900px;
		margin: 2rem auto;
		margin-top: 5rem;
		padding: 0 1rem;
		padding-bottom: 4rem;
		color: var(--text-color);
	}
	.chart-container {
		background: var(--primary-color);
		padding: 2rem;
		border-radius: 12px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		height: 500px;
		position: relative;
		border: 1px solid var(--border-color);
		margin-top: 1rem;
	}

	.range-selection {
		display: flex;
		justify-content: center;
		align-items: center;
		margin-block: 1rem;
	}

	.back-btn {
		position: fixed;
		top: 2rem;
		left: 2rem;
		background: none;
		outline: none;
		border: none;

		color: var(--subtle-text-color);
		font-size: 1.2rem;
		font-weight: bold;
		cursor: pointer;
	}

	.back-btn:hover {
		color: var(--text-color);
	}
</style>
