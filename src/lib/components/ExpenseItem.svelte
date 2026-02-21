<script lang="ts">
	import { formatDate, type Expense } from '$lib';
	import { capitalize } from '$lib/utils';

	import { ChevronDown } from '@lucide/svelte';
	import { scale, slide } from 'svelte/transition';

	type Props = {
		expense: Expense;
		deleteFunc: (id: string) => void;
	};

	let { expense, deleteFunc }: Props = $props();

	let open = $state(false);
</script>

<li class="expense-item">
	<div class="upper">
		<div class="expense-details">
			<span class="title">{expense.title}</span>
			<span class="category">{capitalize(expense.category)}</span>
		</div>
		<div class="expense-value">
			<span class="total">S${expense.amount.toFixed(2)}</span>
			<span class="date">{formatDate(expense.timestamp.toDate())}</span>
		</div>
		<button class="open-btn" class:open onclick={() => (open = !open)}>
			<span class="chevron">
				<ChevronDown />
			</span>
		</button>
	</div>
	{#if open}
		<div class="additional-details" transition:slide>
			<pre class="description" transition:scale>{expense.description}</pre>
			<div class="buttons">
				<button onclick={() => deleteFunc(expense.id)} class="delete-btn">Delete</button>
				<button class="edit-btn">Edit</button>
			</div>
		</div>
	{/if}
</li>

<style>
	button {
		display: block;
		padding: 0;
		margin: 0;
	}

	pre {
		width: 100%;
		overflow-x: auto;
		padding: 0.5rem;
	}

	.expense-item {
		background-color: var(--primary-color);
		border: 1px solid var(--border-color);
		border-radius: 8px;
		margin-bottom: 1rem;
		transition: background-color 0.2s;
		color: var(--text-color);
	}

	.expense-item .upper {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
		padding: 1rem;
	}

	.expense-item:hover {
		background-color: #3a3a3a;
	}

	.expense-details {
		flex: 1 1 auto;
	}

	.expense-details .title {
		display: block;
		font-size: 1.1rem;
		font-weight: 500;
	}

	.expense-details .category {
		font-size: 0.9rem;
		color: var(--subtle-text-color);
	}

	.expense-value {
		text-align: right;
	}

	.expense-value .total {
		display: block;
		font-size: 1.2rem;
		font-weight: bold;
	}

	.expense-value .date {
		font-size: 0.8rem;
		color: var(--subtle-text-color);
	}

	.open-btn {
		background: none;
		border: none;
		color: var(--subtle-text-color);
		cursor: pointer;
		padding: 0.5rem;
	}

	.open-btn .chevron {
		display: flex;
		justify-content: center;
		align-items: center;
		transition: transform 0.2s;
		transform: rotate(0deg);
	}

	.open-btn.open .chevron {
		transform: rotate(180deg);
	}

	.additional-details {
		padding: 1rem;
		border-top: 1px solid var(--border-color);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: stretch;
	}

	.additional-details .description {
		font-size: 0.9rem;
		color: var(--subtle-text-color);
		flex: 1;
	}

	.additional-details .buttons {
		display: flex;
		gap: 0.5rem;
		align-self: flex-end;
	}

	.additional-details .delete-btn,
	.additional-details .edit-btn {
		background-color: var(--secondary-color);
		color: var(--text-color);
		border: 1px solid var(--border-color);
		padding: 0.5rem 1rem;
		border-radius: 0.25rem;
		cursor: pointer;
	}

	.additional-details .delete-btn {
		background-color: #992222;
		color: white;
	}
</style>
