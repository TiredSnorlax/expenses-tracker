<script lang="ts">
	import NewExpenseMenu from './NewExpenseMenu.svelte';

	import type { Expense } from '$lib';
	import type { Receipt } from '$lib/prompt';
	import ReceiptExpensesList from './ReceiptExpensesList.svelte';
	import ReceiptScanMenu from './ReceiptScanMenu.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import { slide, fly } from 'svelte/transition';

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
	let direction = $state(1);

	const nextPage = () => {
		if (currentPage < MAX_PAGES) {
			direction = 1;
			currentPage++;
		}
	};

	const prevPage = () => {
		direction = -1;
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

	const closePage = () => {
		addExpensesMenuOpen = false;
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

<div class="container" transition:slide>
	<div class="content">
		{#key currentPage}
			<div
				class="page-transition-wrapper"
				in:fly={{ x: direction * 100 + 'vw', duration: 400, opacity: 1 }}
				out:fly={{ x: -direction * 100 + 'vw', duration: 400, opacity: 1 }}
			>
				{#if currentPage === 0}
					<div class="prompt">
						<h2>How would you like to add expenses?</h2>
						<div class="buttons">
							<button
								onclick={() => {
									direction = 1;
									currentPage = 1;
								}}>Manually</button
							>
							<button
								onclick={() => {
									direction = 1;
									currentPage = 2;
								}}>Images</button
							>
						</div>
					</div>
				{/if}
				{#if currentPage === 1}
					<NewExpenseMenu {addExpenses} {categories} />
				{/if}
				{#if currentPage === 2}
					<ReceiptScanMenu bind:receipts {nextPage} />
				{/if}
				{#if currentPage === 3 && receipts.length > 0}
					<ReceiptExpensesList bind:receipts {closePage} {addExpenses} {categories} />
				{/if}
			</div>
		{/key}
		<button class="cancel-btn" onclick={prevPage}><ArrowLeft /></button>
	</div>
</div>

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
		height: 100%;
		overflow: hidden;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		background: var(--background-color);
	}

	.page-transition-wrapper {
		grid-column: 1;
		grid-row: 1;
		width: 100%;
		height: 100%;
		overflow-y: auto;
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

	@media (max-width: 600px) {
		h2 {
			text-wrap: wrap;
			padding-inline: 2rem;
			text-align: center;
		}
		.buttons {
			flex-direction: column;
		}
	}
</style>
