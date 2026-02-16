<script lang="ts">
	import { createNewExpense, type Expense } from '$lib';
	import { Timestamp } from 'firebase/firestore';
	import { onMount } from 'svelte';

	type Props = {
		addExpenses: (newExpenses: Expense[]) => Promise<void>;
		categories: string[];
		nextPage: () => void;
		prevPage: () => void;
	};

	let { addExpenses, categories, nextPage, prevPage }: Props = $props();

	let newExpense: Expense | null = $state(null);
	let showNewCategoryInput = $state(false);

	const addNewExpense = () => {
		if (!newExpense) return;
		addExpenses([newExpense]);
		newExpense = null;
	};

	onMount(() => {
		newExpense = createNewExpense();
	});
</script>

{#if newExpense}
	<div class="card">
		<h3>New Expense</h3>
		<div class="card-content">
			<div class="input-container">
				<label for="title">Title</label>
				<input
					id="title"
					type="text"
					bind:value={newExpense.title}
					placeholder="What did you spend on?"
				/>
			</div>
			<div class="input-container">
				<label for="description">Description</label>
				<textarea
					id="description"
					bind:value={newExpense.description}
					placeholder="Add more details (optional)"
				></textarea>
			</div>
			<div class="input-container">
				<label for="category">Category</label>
				<select
					id="category"
					bind:value={newExpense.category}
					onchange={(e) => {
						if (e.currentTarget.value === 'Other' && newExpense) {
							showNewCategoryInput = true;
							newExpense.category = '';
						} else {
							showNewCategoryInput = false;
						}
					}}
				>
					{#each categories as category}
						<option value={category}>{category}</option>
					{/each}
					<option value="Other">Other</option>
				</select>
			</div>
			{#if showNewCategoryInput}
				<div class="input-container">
					<label for="new-category">New Category</label>
					<input
						id="new-category"
						type="text"
						bind:value={newExpense.category}
						placeholder="Enter new category"
					/>
				</div>
			{/if}
			<div class="input-container">
				<label for="amount">Amount</label>
				<div>
					<span>$</span>
					<input id="amount" type="number" bind:value={newExpense.amount} />
				</div>
			</div>
			<div class="buttons">
				<button class="add-button" onclick={addNewExpense}>Add Expense</button>
				<button class="add-button" onclick={nextPage}>Scan Receipts</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.card {
		padding: 2rem;
		border-radius: 8px;
		width: 100%;
	}

	h3 {
		text-align: center;
		margin-top: 0;
		margin-bottom: 2rem;
		font-size: 1.5rem;
		font-weight: 500;
	}

	.card-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.input-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-size: 1.1rem;
		color: var(--subtle-text-color);
	}

	input,
	textarea,
	select {
		background-color: var(--primary-color);
		color: var(--text-color);
		border: 1px solid var(--border-color);
		padding: 0.75rem;
		border-radius: 4px;
		font-size: 1rem;
		font-family: inherit;
	}

	/* Remove arrow in number field */
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
		margin: 0;
	}

	.buttons {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1rem;
	}

	button {
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
	}

	.add-button {
		background-color: var(--secondary-color);
		color: white;
	}

	.cancel-button {
		background-color: transparent;
		color: var(--subtle-text-color);
		border: 1px solid var(--border-color);
	}
</style>
