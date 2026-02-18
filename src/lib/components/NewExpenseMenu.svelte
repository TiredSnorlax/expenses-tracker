<script lang="ts">
	import { createNewExpense, type Expense } from '$lib';
	import { onMount } from 'svelte';
	import DropdownSelection from './inputs/DropdownSelection.svelte';

	type Props = {
		addExpenses: (newExpenses: Expense[]) => Promise<void>;
		categories: string[];
	};

	let { addExpenses, categories }: Props = $props();

	let newExpense: Expense | null = $state(null);

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
			<div class="input-container category">
				<DropdownSelection name="Category" options={categories} value={newExpense.category} />
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
				<label for="amount">Amount</label>
				<div class="amount-input-wrapper">
					<span>$</span>
					<input id="amount" type="number" bind:value={newExpense.amount} placeholder="0.00" />
				</div>
			</div>
			<div class="buttons">
				<button class="add-button" onclick={addNewExpense}>Add Expense</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.card {
		padding: 2rem;
		border-radius: 8px;
		width: 100%;

		margin: 0 auto;
		max-width: 800px;
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
	textarea {
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

	.amount-input-wrapper {
		display: flex;
		align-items: center;
		background-color: var(--primary-color);
		border-radius: 8px;
		padding: 0 1rem;
		border: 1px solid var(--primary-color);
		transition: border-color 0.2s;
	}

	.amount-input-wrapper:focus-within {
		border-color: var(--secondary-color);
		outline: 1px solid var(--secondary-color);
	}

	.amount-input-wrapper span {
		font-size: 2.5rem;
		font-weight: 300;
		color: var(--subtle-text-color);
		margin-right: 0.75rem;
	}

	.amount-input-wrapper input {
		font-size: 2.5rem;
		font-weight: 600;
		color: var(--text-color);
		background-color: transparent;
		border: none;
		outline: none;
		padding: 0.75rem 0;
		width: 100%;
	}

	.amount-input-wrapper input#amount {
		padding: 0.75rem 0;
	}
</style>
