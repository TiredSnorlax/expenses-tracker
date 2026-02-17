<script lang="ts">
	import NewExpenseMenu from './NewExpenseMenu.svelte';

	import type { Expense } from '$lib';
	import type { Receipt } from '$lib/prompt';
	import ReceiptExpensesList from './ReceiptExpensesList.svelte';
	import ReceiptScanMenu from './ReceiptScanMenu.svelte';
	import { ArrowLeft } from '@lucide/svelte';

	type Props = {
		addExpensesMenuOpen: boolean;
		categories: string[];
		addExpenses: (newExpenses: Expense[]) => Promise<void>;
	};

	let { addExpensesMenuOpen = $bindable(), categories, addExpenses }: Props = $props();

	// First page for adding expenses manually
	// Second page for adding expenses through images
	const MAX_PAGES = 3;
	let currentPage = $state(0);

	const nextPage = () => {
		if (currentPage < MAX_PAGES) {
			currentPage++;
		}
	};

	const prevPage = () => {
		if (currentPage == 1 || currentPage == 2) {
			// Past Mode Selection
			currentPage = 0;
		} else if (currentPage > 2) {
			currentPage--;
		} else {
			// At first page
			addExpensesMenuOpen = false;
		}
	};

	let receipts: (Receipt | null)[] = $state([]);

	let onAddExpenses = async (newExpenses: Expense[]) => {
		await addExpenses(newExpenses);

		// Reset
		receipts = [];
		currentPage = 0;
		addExpensesMenuOpen = false;
	};
</script>

{#if addExpensesMenuOpen}
	<div class="container">
		<div class="content">
			{#if currentPage === 0}
				<div class="prompt">
					<h2>How would you like to add expenses?</h2>
					<div class="buttons">
						<button onclick={() => (currentPage = 1)}>Manually</button>
						<button onclick={() => (currentPage = 2)}>Images</button>
					</div>
				</div>
			{/if}
			{#if currentPage === 1}
				<NewExpenseMenu {addExpenses} {categories} />
			{/if}
			{#if currentPage === 2}
				<ReceiptScanMenu bind:receipts {nextPage} {prevPage} />
			{/if}
			{#if currentPage === 3 && receipts.length > 0}
				<ReceiptExpensesList bind:receipts {prevPage} {addExpenses} {categories} />
			{/if}
			<button class="cancel-btn" onclick={prevPage}><ArrowLeft /></button>
		</div>
	</div>
{/if}

<style>
	.container {
		position: fixed;
		inset: 0;

		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		background: rgba(0, 0, 0, 0.2);
	}

	.content {
		width: 100%;
		min-height: 100%;
		overflow: auto;
		background: var(--background-color);
	}

	.prompt {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.buttons {
		margin-top: 2rem;
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.buttons button {
		width: 200px;
		padding: 1rem;
		font-size: 1.2rem;

		border-radius: 0.5rem;
		background: var(--primary-color);
		color: var(--text-color);
		border: 2px solid var(--border-color);

		cursor: pointer;
	}

	.buttons button:hover {
		background: var(--secondary-color);
	}

	.cancel-btn {
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

	.cancel-btn:hover {
		color: var(--text-color);
	}
</style>
