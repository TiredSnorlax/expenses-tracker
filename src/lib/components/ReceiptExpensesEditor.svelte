<script lang="ts">
	import type { Receipt } from '$lib/prompt';
	import { ChevronDown, ThumbsUp } from '@lucide/svelte';
	import DropdownSelection from './inputs/DropdownSelection.svelte';
	import { slide } from 'svelte/transition';

	type Props = {
		receipt: Receipt;
		confirmed: boolean;
		index: number;
		categories: string[];
	};

	let { receipt = $bindable(), confirmed = $bindable(), index, categories }: Props = $props();

	let itemsOpen = $state(true);
	let taxesOpen = $state(true);

	const getTotal = () => {
		let total = 0;
		for (const item of receipt.items) {
			let itemPrice = item.unit_price;
			if (item.add_ons) {
				for (const add_on of item.add_ons) {
					itemPrice += add_on.price;
				}
			}
			total += item.quantity * itemPrice;
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
			unit_price: 0,
			add_ons: []
		});
		receipt.items = receipt.items; // for reactivity
	};

	const removeItem = (index: number) => {
		receipt.items.splice(index, 1);
		receipt.items = receipt.items; // for reactivity
	};

	const addAddon = (itemIndex: number) => {
		const item = receipt.items[itemIndex];
		if (!item.add_ons) {
			item.add_ons = [];
		}
		item.add_ons.push({
			name: 'New Addon',
			price: 0
		});
		receipt.items = receipt.items;
	};

	const removeAddon = (itemIndex: number, addonIndex: number) => {
		const item = receipt.items[itemIndex];
		if (item.add_ons) {
			item.add_ons.splice(addonIndex, 1);
			receipt.items = receipt.items;
		}
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

	const onConfirm = () => {
		itemsOpen = confirmed;
		taxesOpen = confirmed;
		confirmed = !confirmed;
	};
</script>

<div class="editor-card">
	<h2>Receipt {index + 1}</h2>
	<div class="form-section">
		<input
			id="receipt-name"
			class="receipt-name"
			type="text"
			placeholder="Item Name"
			bind:value={receipt.name}
		/>
	</div>
	<div class="form-section">
		<DropdownSelection name="Category" options={categories} bind:value={receipt.category} />
	</div>
	<div class="form-section">
		<div class="form-header">
			<h4>Items</h4>
			<button class="open-btn" class:open={itemsOpen} onclick={() => (itemsOpen = !itemsOpen)}>
				<span class="chevron">
					<ChevronDown />
				</span>
			</button>
		</div>
		{#if itemsOpen}
			<div class="line-items-grid" transition:slide>
				<p>No.</p>
				<p class="name">Name</p>
				<p>Qty</p>
				<p>Price</p>
				<p></p>
				{#each receipt.items as item, i}
					<p>{i + 1}.</p>
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
					<div class="add-addons">
						{#if item.add_ons && item.add_ons.length > 0}
							<div class="addon-items-grid" style="margin-bottom: 0.5rem">
								<p class="name">Addon Name</p>
								<p>Price</p>
								<p></p>
								{#each item.add_ons as addon, j}
									<input
										class="item-name"
										type="text"
										placeholder="Addon"
										bind:value={addon.name}
									/>
									<input
										class="item-price"
										type="number"
										step="0.01"
										placeholder="Price"
										bind:value={addon.price}
									/>
									<button class="remove-btn" onclick={() => removeAddon(i, j)}>✕</button>
								{/each}
							</div>
						{/if}
						<button class="add-btn addon" onclick={() => addAddon(i)}>+ Add Addon</button>
					</div>
				{/each}
			</div>
			<button class="add-btn" onclick={addItem}>+ Add Item</button>
		{/if}
	</div>

	<div class="form-section">
		<div class="form-header">
			<h4>Taxes</h4>
			<button class="open-btn" class:open={taxesOpen} onclick={() => (taxesOpen = !taxesOpen)}>
				<span class="chevron">
					<ChevronDown />
				</span>
			</button>
		</div>
		{#if taxesOpen}
			<div class="tax-items-grid" transition:slide>
				<p>No.</p>
				<p class="name">Name</p>
				<p>%</p>
				<p>Inclusive</p>
				<p></p>
				{#each receipt.taxes as tax, i}
					<p>{i + 1}.</p>
					<input class="tax-name" type="text" placeholder="Tax Name" bind:value={tax.name} />
					<input
						class="tax-percent"
						type="number"
						step="0.01"
						placeholder="%"
						bind:value={tax.percentage}
					/>
					<input type="checkbox" bind:checked={tax.inclusive} />
					<button class="remove-btn" onclick={() => removeTax(i)}>✕</button>
				{/each}
			</div>
			<button class="add-btn" onclick={addTax}>+ Add Tax</button>
		{/if}
	</div>

	<div class="form-section total">
		<h3>Total Spent</h3>
		<div class="row">
			<p>Total</p>
			<span></span>
			<p>Split</p>
			<p>You Paid</p>

			<p class="total-value">${receipt.total.toFixed(2)}</p>
			<p>x</p>
			<input
				class="split-input"
				type="number"
				min="0"
				max="1"
				step="0.01"
				bind:value={receipt.split}
			/>
			<p class="total-value">${(receipt.split * receipt.total).toFixed(2)}</p>
		</div>
		<input
			class="split-slider"
			type="range"
			min="0"
			max="1"
			step="0.01"
			bind:value={receipt.split}
		/>
	</div>

	<button class="confirm-btn" class:confirmed onclick={onConfirm}>
		{#if confirmed}
			<ThumbsUp />
		{:else}
			Confirm
		{/if}
	</button>
</div>

<style>
	/* General Resets and Base Styles */
	.editor-card {
		background-color: var(--primary-color);
		border: 1px solid var(--border-color);
		border-radius: 0.8rem;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
		font-family: inherit;
		width: 100%;
		max-width: 700px;
	}

	h2,
	h3,
	h4 {
		margin: 0;
		font-weight: 600; /* Bolder headings */
		color: var(--text-color);
	}

	h2 {
		font-size: 1.8rem;
		text-align: center;
	}

	h3 {
		font-size: 1.4rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color);
	}

	h4 {
		font-size: 1.2rem;
	}

	p {
		text-align: center;
		color: var(--subtle-text-color);
		margin: 0;
	}

	p.name {
		text-align: left;
	}

	/* Form Sections */
	.form-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-header {
		display: flex;
		justify-content: space-between;
		align-items: center;

		background: var(--border-color);
		padding: 0.5rem;
		border-radius: 0.5rem;
	}

	.form-header .open-btn {
		background: none;
		border: none;
		color: var(--subtle-text-color);
		cursor: pointer;
		padding: 0.5rem;
	}

	.form-header .open-btn .chevron {
		transition: transform 0.2s;
		transform: rotate(0deg);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.open-btn.open .chevron {
		transform: rotate(180deg);
	}

	/* Input Styling */
	input {
		padding: 0.8rem 0.5rem;
		border-radius: 0.5rem;
		border: 1px solid var(--border-color);
		background-color: var(--background-color);
		color: var(--text-color);
		font-size: 1rem;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	input:focus {
		outline: none;
		border-color: var(--secondary-color);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--secondary-color) 20%, transparent);
	}

	/* Differentiating inputs */
	#receipt-name {
		font-size: 1.2rem;
		font-weight: 500;
		padding: 1rem;
		background-color: color-mix(in srgb, var(--border-color) 50%, var(--background-color));
		border-color: color-mix(in srgb, var(--border-color) 50%, var(--background-color));
	}

	input[type='range'] {
		padding: 0;
		accent-color: var(--secondary-color);
	}
	input[type='checkbox'] {
		accent-color: var(--secondary-color);
		width: 1.2rem;
		height: 1.2rem;
		margin: auto;
	}

	/* Grids for line items */
	.line-items-grid,
	.tax-items-grid,
	.addon-items-grid {
		display: grid;
		gap: 0.75rem;
		align-items: center;
	}

	.line-items-grid,
	.tax-items-grid {
		grid-template-columns: 2rem 1fr 4.5rem 4.5rem auto;
	}

	.add-addons {
		grid-column: 2 / -1;
		padding-left: 1rem;
		border-left: 2px solid var(--border-color);
		padding-top: 0.5rem;
	}

	.addon-items-grid {
		grid-template-columns: 1fr 4.5rem auto;
	}

	.item-name,
	.tax-name {
		min-width: 10px;
	}

	/* Make number inputs less prominent */
	.item-price,
	.item-qty,
	.tax-percent {
		text-align: center;
		min-width: 40px;
		background-color: color-mix(in srgb, var(--border-color) 50%, var(--background-color));
		font-weight: 500;
	}

	.line-items-grid p,
	.tax-items-grid p {
		font-size: 0.9rem;
	}

	/* Buttons */
	.remove-btn,
	.add-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		color: var(--subtle-text-color);
		transition: all 0.2s;
		padding: 0.5rem;
	}

	.remove-btn {
		font-size: 1.2rem;
		border-radius: 50%;
		width: 32px;
		height: 32px;
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.remove-btn:hover {
		color: white;
		background-color: #e53e3e; /* Red for delete */
	}

	.add-btn {
		border: 1px dashed var(--border-color);
		border-radius: 0.5rem;
		text-align: center;
		width: 100%;
	}

	.add-btn:hover {
		background-color: var(--border-color);
		color: var(--text-color);
		border-style: solid;
	}

	.add-btn.addon {
		width: auto;
		font-size: 0.9rem;
	}

	.confirm-btn {
		background-color: var(--secondary-color);
		color: white;
		border: none;
		padding: 0.8rem 1rem;
		border-radius: 0.5rem;
		cursor: pointer;
		font-size: 1.2rem;
		font-weight: 600;
		height: 3rem;
		transition: all 0.2s;
	}

	.confirm-btn:hover {
		opacity: 0.9;
	}

	.confirm-btn.confirmed {
		background-color: transparent;
		outline: 2px solid var(--secondary-color);
		color: var(--secondary-color);
	}

	/* Total section */
	.form-section.total {
		background-color: color-mix(in srgb, var(--border-color) 50%, var(--background-color));
		padding: 1.5rem;
		border-radius: 0.8rem;
	}

	.total .row {
		display: grid;
		grid-template-columns: 1fr 2rem 1fr 2fr;
		gap: 0.5rem;

		align-content: center;
		align-items: center;
		justify-content: center;
	}

	.total-value {
		font-size: 2rem;
		font-weight: 600;
	}

	.split-input {
		font-size: 1.5rem;
		width: 5rem;
		align-self: center;
		text-align: center;
		background: none;
		margin: auto;
	}

	.split-slider {
		flex: 1;
	}

	@media (max-width: 600px) {
		.editor-card {
			padding: 1rem;
			padding-inline: 0.5rem;
			gap: 0.5rem;
		}

		.line-items-grid,
		.tax-items-grid {
			grid-template-columns: 1.5rem 1fr 3rem 3rem auto;
		}
	}
</style>
