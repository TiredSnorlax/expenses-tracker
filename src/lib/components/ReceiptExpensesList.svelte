<script lang="ts">
	import { createNewExpense, type Expense } from '$lib';
	import type { Receipt } from '$lib/prompt';
	import { onMount } from 'svelte';
	import ReceiptExpensesEditor from './ReceiptExpensesEditor.svelte';

	type Props = {
		receipts: (Receipt | null)[];
		closePage: () => void;
		addExpenses: (expenses: Expense[]) => Promise<void>;
		categories: string[];
	};

	let { receipts = $bindable(), closePage, addExpenses, categories }: Props = $props();

	let confirmed: boolean[] = $state([]);
	let allConfirmed = $derived(confirmed.every((c) => c));

	onMount(() => {
		if (confirmed.length === 0 && receipts.length > 0) {
			receipts.map((res) => {
				// Receipts that couldn't be parsed are auto confirmed
				if (res) confirmed.push(false);
				else confirmed.push(true);
			});
		}
	});

	const generateExpenses = async () => {
		let out: Expense[] = [];
		for (const receipt of receipts) {
			if (receipt) {
				let newExpense = createNewExpense();
				newExpense.title = receipt.name;
				newExpense.amount = receipt.total * receipt.split;
				newExpense.category = receipt.category;
				newExpense.description = `Paid for ${receipt.split} share\n\n`;

				for (const item of receipt.items) {
					let itemDesc = `${item.quantity} x ${item.name}($${item.unit_price.toFixed(2)})\n`;
					if (item.add_ons.length > 0) {
						let addOnsCost = item.add_ons.reduce((acc, curr) => acc + curr.price, 0);
						itemDesc += `\tAdd-ons ($${addOnsCost.toFixed(2)}): ${item.add_ons.map((addOn) => addOn.name).join(',\n\t')}\n`;
					}
					newExpense.description = newExpense.description.concat(itemDesc);
				}
				out.push(newExpense);
			}
		}
		await addExpenses(out);
		closePage();
	};
</script>

<div class="list-container">
	{#if receipts.length === 0}
		<p class="empty-message">No receipts processed yet.</p>
	{:else}
		{#each receipts as _receipt, i (i)}
			{#if receipts[i]}
				<ReceiptExpensesEditor
					bind:receipt={receipts[i]}
					bind:confirmed={confirmed[i]}
					index={i}
					{categories}
				/>
			{:else}
				<div class="error-card">
					<h2>Receipt {i + 1}</h2>
					<p>We couldn't read the data from this receipt. Please enter it manually.</p>
				</div>
			{/if}
		{/each}
	{/if}
	<button class="confirm-btn" disabled={!allConfirmed} onclick={generateExpenses}>Upload</button>
</div>

<style>
	.list-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		width: 100%;
		padding: 2rem 1rem;
		padding-top: 5rem;
	}

	.empty-message {
		text-align: center;
		color: var(--subtle-text-color);
		font-size: 1.2rem;
	}

	.error-card {
		background-color: var(--primary-color);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 1.5rem;
		text-align: center;
		color: var(--subtle-text-color);
	}

	.error-card h2 {
		margin: 0 0 0.5rem 0;
		color: var(--text-color);
	}

	.confirm-btn {
		background: var(--secondary-color);
		color: var(--text-color);
		padding: 1rem;
		border-radius: 5px;
		cursor: pointer;
		font-size: 1rem;

		width: 100%;
		max-width: 700px;

		transition: all 0.3s ease;
	}

	.confirm-btn:disabled {
		background: var(--primary-color);
		color: var(--subtle-text-color);
		cursor: not-allowed;
		padding: 0.5rem 1rem;
	}
</style>
