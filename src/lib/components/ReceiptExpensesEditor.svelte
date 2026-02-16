<script lang="ts">
	import type { Receipt } from '$lib/prompt';
	import { ThumbsUp } from '@lucide/svelte';

	type Props = {
		receipt: Receipt;
		confirmed: boolean;
		index: number;
	};

	let { receipt = $bindable(), confirmed = $bindable(), index }: Props = $props();

	const getTotal = () => {
		console.log('get total');
		let total = 0;
		for (const item of receipt.items) {
			total += item.quantity * item.unit_price;
		}
		for (const tax of receipt.taxes) {
			if (!tax.inclusive) total += (total * tax.percentage) / 100;
		}
		// Update the total property of the receipt object
		receipt.total = total;
		return total;
	};

	$effect(() => {
		if (!receipt) return;
		receipt.total = getTotal();
	});

	const addItem = () => {
		receipt.items.push({
			name: 'New Item',
			quantity: 1,
			unit_price: 0
		});
		receipt.items = receipt.items; // for reactivity
	};

	const removeItem = (index: number) => {
		receipt.items.splice(index, 1);
		receipt.items = receipt.items; // for reactivity
	};

	const addTax = () => {
		receipt.taxes.push({
			name: 'New Tax',
			percentage: 0,
			inclusive: true
		});
		receipt.taxes = receipt.taxes; // for reactivity
	};

	const removeTax = (index: number) => {
		receipt.taxes.splice(index, 1);
		receipt.taxes = receipt.taxes; // for reactivity
	};
</script>

<div class="editor-card">
	<h2>Receipt {index + 1}</h2>
	<div class="form-section">
		<label for="receipt-name">Receipt Name:</label>
		<input
			id="receipt-name"
			class="receipt-name"
			type="text"
			placeholder="Item Name"
			bind:value={receipt.name}
		/>
	</div>
	<div class="form-section">
		<h4>Items</h4>
		<div class="line-items-grid">
			<p class="name">Name</p>
			<p>Qty</p>
			<p>Price</p>
			<p></p>
			{#each receipt.items as item, i}
				<input class="item-name" type="text" placeholder="Item Name" bind:value={item.name} />
				<input class="item-qty" type="number" placeholder="Qty" bind:value={item.quantity} />
				<input
					class="item-price"
					type="number"
					step="0.01"
					placeholder="Price"
					bind:value={item.unit_price}
				/>
				<button class="remove-btn" onclick={() => removeItem(i)}>✕</button>
			{/each}
		</div>
		<button class="add-btn" onclick={addItem}>+ Add Item</button>
	</div>

	<div class="form-section">
		<h4>Taxes</h4>
		<div class="tax-items-grid">
			<p class="name">Name</p>
			<p>%</p>
			<p></p>
			{#each receipt.taxes as tax, i}
				<input class="tax-name" type="text" placeholder="Tax Name" bind:value={tax.name} />
				<input
					class="tax-percent"
					type="number"
					step="0.01"
					placeholder="%"
					bind:value={tax.percentage}
				/>
				<button class="remove-btn" onclick={() => removeTax(i)}>✕</button>
			{/each}
		</div>
		<button class="add-btn" onclick={addTax}>+ Add Tax</button>
	</div>

	<div class="form-section total">
		<h3>Total Spent</h3>
		<div>
			<p>Total : ${receipt.total}</p>
		</div>
		<div>
			<p>Split :</p>
			<input type="number" bind:value={receipt.split} />
			<input id="total" type="range" min="0" max="1" step="0.01" bind:value={receipt.split} />
		</div>
		<div>
			<p>Paid : {(receipt.split * receipt.total).toFixed(2)}</p>
		</div>
		<div>
			<label for="category">Category: </label>
			<input type="text" placeholder="Category" bind:value={receipt.category} />
		</div>
	</div>

	<button class="confirm-btn" class:confirmed onclick={() => (confirmed = !confirmed)}>
		{#if confirmed}
			<ThumbsUp />
		{:else}
			Confirm
		{/if}
	</button>
</div>

<style>
	input {
		padding: 0.5rem;
		border-radius: 0.3rem;
		border: 1px solid var(--border-color);
		background-color: var(--background-color);
		color: var(--text-color);
		font-size: 1rem;
	}

	input[type='range'] {
		padding: 0;
	}

	h2 {
		margin: 0;
		margin-bottom: 1rem;
		text-align: center;
	}

	h3 {
		font-size: 1.4rem;
	}

	h4 {
		font-size: 1.2rem;
	}

	h3,
	h4 {
		margin: 0;
		font-weight: 500;
		color: var(--subtle-text-color);
		border-bottom: 1px solid var(--border-color);
		padding-bottom: 0.5rem;
	}

	p {
		text-align: center;
	}

	p.name {
		text-align: left;
	}

	.editor-card {
		background-color: var(--primary-color);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		font-family: inherit;

		width: 100%;
	}

	.form-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.form-section.total div {
		flex: 1 1 auto;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
	}

	.form-section.total > div input {
		flex: 1 1 auto;
	}
	.line-items-grid,
	.tax-items-grid {
		display: grid;
		gap: 0.5rem;
		align-items: center;
	}
	.line-items-grid {
		grid-template-columns: 1fr 4rem 4rem auto;
	}
	.tax-items-grid {
		grid-template-columns: 1fr 4rem auto;
	}

	.item-name,
	.tax-name {
		min-width: 10px;
	}

	.item-price,
	.item-qty,
	.tax-percent {
		text-align: center;
		min-width: 40px;
	}

	.line-items-grid p,
	.tax-items-grid p {
		font-size: 0.9rem;
		color: var(--subtle-text-color);
		margin: 0;
	}
	.remove-btn,
	.add-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		color: var(--subtle-text-color);
	}
	.remove-btn {
		font-size: 1.2rem;
		padding: 0 0.5rem;
	}
	.remove-btn:hover {
		color: red;
	}
	.add-btn {
		border: 1px dashed var(--border-color);
		border-radius: 0.3rem;
		padding: 0.5rem;
		text-align: center;
		margin-top: 0.5rem;
		transition: background-color 0.2s;
	}
	.add-btn:hover {
		background-color: var(--border-color);
	}
	.confirm-btn {
		background-color: var(--secondary-color);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 1.2rem;

		height: 3rem;
	}

	.confirm-btn.confirmed {
		background-color: var(--primary-color);
		outline: 1px dashed var(--text-color);
		color: var(--text-color);
	}
</style>
