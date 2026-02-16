<script lang="ts">
	import NewExpenseMenu from './NewExpenseMenu.svelte';

	import type { Expense } from '$lib';
	import type { Receipt } from '$lib/prompt';
	import ReceiptExpensesList from './ReceiptExpensesList.svelte';
	import ReceiptScanMenu from './ReceiptScanMenu.svelte';

	type Props = {
		addExpensesMenuOpen: boolean;
		categories: string[];
		addExpenses: (newExpenses: Expense[]) => Promise<void>;
	};

	let { addExpensesMenuOpen = $bindable(), categories, addExpenses }: Props = $props();

	// First page for adding expenses manually
	// Second page for adding expenses through images
	const MAX_PAGES = 2;
	let currentPage = $state(0);

	const nextPage = () => {
		if (currentPage < MAX_PAGES) {
			currentPage++;
		} else {
			currentPage = 0;
		}
	};

	const prevPage = () => {
		if (currentPage > 0) {
			currentPage--;
		} else {
			currentPage = MAX_PAGES;
		}
	};

	let receipts: (Receipt | null)[] = $state([]);
</script>

{#if addExpensesMenuOpen}
	<div class="container">
		<div class="content">
			{#if currentPage === 0}
				<NewExpenseMenu {addExpenses} {categories} {nextPage} {prevPage} />
			{/if}
			{#if currentPage === 1}
				<ReceiptScanMenu bind:receipts {nextPage} {prevPage} />
			{/if}
			{#if currentPage === 2 && receipts.length > 0}
				<ReceiptExpensesList bind:receipts {prevPage} />
			{/if}
			<button onclick={() => (addExpensesMenuOpen = false)}>Cancel</button>
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
</style>
