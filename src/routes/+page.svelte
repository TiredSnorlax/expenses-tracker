<script lang="ts">
	import { defaultExpenses, type Expense, type Profile } from '$lib';
	import ExpenseList from '$lib/components/ExpenseList.svelte';
	import Info from '$lib/components/Info.svelte';
	import SignIn from '$lib/components/SignIn.svelte';
	import UserAvatar from '$lib/components/UserAvatar.svelte';
	import { authStore } from '$lib/stores/auth';

	import { db } from '$lib/firebase';
	import {
		doc,
		getDoc,
		setDoc,
		collection,
		query,
		where,
		getDocs,
		Timestamp
	} from 'firebase/firestore';

	let currentDate = $state(new Date());
	let expenses: Expense[] = $state(defaultExpenses());

	let user = $derived($authStore.user);
	let profile: Profile | null = $state(null);

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
				expenses: []
			};
			await setDoc(docRef, newProfile);
			profile = newProfile;
		}
	};

	const getExpensesForCurrentMonth = async () => {
		if (!user) return;
		const date = new Date(currentDate);
		const year = date.getFullYear();
		const month = date.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);

		const expensesCol = collection(db, 'expenses');
		const q = query(
			expensesCol,
			where('profileId', '==', user.uid),
			where('timestamp', '>=', firstDay),
			where('timestamp', '<=', lastDay)
		);
		const querySnapshot = await getDocs(q);
		expenses = querySnapshot.docs.map((doc) => {
			const data = doc.data() as Expense;
			return data;
		});
	};

	$effect(() => {
		if (user) getOrCreateProfile();
	});

	$effect(() => {
		if (user) {
			getExpensesForCurrentMonth();
		}
	});
</script>

<main class="container">
	{#if user && profile}
		<UserAvatar {user} />
		<Info bind:currentDate bind:expenses {profile} />
		<ExpenseList bind:expenses {profile} {user} />
	{:else}
		<SignIn />
	{/if}
</main>

<style>
	.container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 0 1rem;
		color: var(--text-color);
	}
</style>
