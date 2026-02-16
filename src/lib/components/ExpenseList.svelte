<script lang="ts">
	import { SortBy, SortDirection, type Expense, type Profile } from '$lib';
	import ExpenseItem from './ExpenseItem.svelte';
	import type { AuthUser } from '$lib/stores/auth';
	import AddExpensesMenu from './AddExpensesMenu.svelte';

	import { arrayRemove, arrayUnion, collection, doc, writeBatch } from 'firebase/firestore';
	import { db } from '$lib/firebase';

	type Props = {
		expenses: Expense[];
		profile: Profile;
		user: AuthUser;
	};

	let { expenses = $bindable(), profile, user }: Props = $props();
	let addExpensesMenuOpen: boolean = $state(false);

	// Filter by Category
	const categories = $derived([...new Set(expenses.map((e) => e.category))]);
	let selectedCategory: string | null = $state(null);

	let sortBy: SortBy = $state(SortBy.Date);
	let sortDirection: SortDirection = $state(SortDirection.Descending);
	let showSortByMenu = $state(false);

	const setSortBy = (sort: SortBy) => {
		if (sort === sortBy) {
			sortDirection =
				sortDirection === SortDirection.Ascending
					? SortDirection.Descending
					: SortDirection.Ascending;
		} else {
			sortBy = sort;
			sortDirection = SortDirection.Descending;
		}
		showSortByMenu = false;
	};

	const processExpenses = () => {
		const categorised = selectedCategory
			? expenses.filter((e) => e.category === selectedCategory)
			: [...expenses];

		switch (sortBy) {
			case SortBy.Date:
				if (sortDirection === SortDirection.Descending)
					return categorised.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
				else return categorised.sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);
			case SortBy.Price:
				if (sortDirection === SortDirection.Descending)
					return categorised.sort((a, b) => b.amount - a.amount);
				else return categorised.sort((a, b) => a.amount - b.amount);
			default:
				return categorised;
		}
	};

	let processedExpenses: Expense[] = $derived.by(processExpenses);

	const addExpenses = async (newExpenses: Expense[]) => {
		if (!user || !newExpenses || newExpenses.length === 0) return;

		try {
			const batch = writeBatch(db);
			const expenseCol = collection(db, 'expenses');
			const newExpenseIds: string[] = [];

			for (const newExpense of newExpenses) {
				// This will auto generate id for new document
				const expenseDocRef = doc(expenseCol);
				newExpense.id = expenseDocRef.id;
				newExpense.profileId = user.uid;
				newExpenseIds.push(expenseDocRef.id);
				// Add the new expense document to the batch
				batch.set(expenseDocRef, newExpense);
			}

			const profileDocRef = doc(db, 'profiles', user.uid);
			batch.update(profileDocRef, {
				expenses: arrayUnion(...newExpenseIds)
			});

			await batch.commit();

			// Local updates
			expenses.push(...newExpenses);
			expenses = expenses;
		} catch (error) {
			console.error('Error adding expenses: ', error);
		}
	};

	const deleteExpense = async (id: string) => {
		if (!user) return;
		try {
			const batch = writeBatch(db);

			const expenseDocRef = doc(db, 'expenses', id);
			batch.delete(expenseDocRef);

			const profileDocRef = doc(db, 'profiles', user.uid);
			batch.update(profileDocRef, {
				expenses: arrayRemove(id)
			});

			await batch.commit();

			// Local updates
			expenses = expenses.filter((expense) => expense.id !== id);
		} catch (error) {
			console.error('Error deleting expense:', error);
		}
	};
</script>

<section>
	<div class="header">
		<h2>Recent Expenses</h2>
		<button class="new-expense-button" onclick={() => (addExpensesMenuOpen = true)}>
			+ New Expense
		</button>
	</div>
	<div class="filters">
		<button class:selected={selectedCategory === null} onclick={() => (selectedCategory = null)}>
			All
		</button>
		{#each categories as category}
			<button
				class:selected={selectedCategory === category}
				onclick={() => (selectedCategory = category)}
			>
				{category}
			</button>
		{/each}
	</div>
	<div class="filter-group">
		<div class="sort-by">
			<button class="sort-by-button" onclick={() => (showSortByMenu = !showSortByMenu)}>
				<span>Sort by: {sortBy}</span>
			</button>
			{#if showSortByMenu}
				<div class="sort-by-menu">
					<button class:selected={sortBy === SortBy.Date} onclick={() => setSortBy(SortBy.Date)}
						>Date
						{#if sortBy == SortBy.Date}
							<span class="direction">{sortDirection === SortDirection.Ascending ? '▲' : '▼'}</span>
						{/if}
					</button>
					<button class:selected={sortBy === SortBy.Price} onclick={() => setSortBy(SortBy.Price)}
						>Price
						{#if sortBy == SortBy.Price}
							<span class="direction">{sortDirection === SortDirection.Ascending ? '▲' : '▼'}</span>
						{/if}
					</button>
				</div>
			{/if}
		</div>
	</div>
	<ul>
		{#each processedExpenses as expense (expense.id)}
			<ExpenseItem {expense} deleteFunc={deleteExpense} />
		{/each}
	</ul>
</section>
<AddExpensesMenu bind:addExpensesMenuOpen {categories} {addExpenses} />

<style>
	.header {
		border-bottom: 2px solid var(--border-color);
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.new-expense-button {
		background-color: var(--secondary-color);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
	}

	.filters {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.filters button {
		background-color: var(--primary-color);
		color: var(--text-color);
		border: 1px solid var(--border-color);
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.filters button.selected {
		background-color: var(--secondary-color);
		color: white;
	}

	.filter-group {
		margin-bottom: 1rem;
	}

	.sort-by {
		position: relative;
		display: inline-block;
	}

	.sort-by-button {
		background-color: var(--primary-color);
		color: var(--text-color);
		border: 1px solid var(--border-color);
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.sort-by-menu {
		position: absolute;
		top: 100%;
		left: 0;
		background-color: var(--primary-color);
		border: 1px solid var(--border-color);
		border-radius: 0.25rem;
		margin-top: 0.25rem;
		z-index: 10;
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.sort-by-menu button {
		background-color: transparent;
		color: var(--text-color);
		border: none;
		padding: 0.75rem 1rem;
		cursor: pointer;
		text-align: left;
	}

	.sort-by-menu button.selected {
		background-color: var(--secondary-color);
	}
</style>
