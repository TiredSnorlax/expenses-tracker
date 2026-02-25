<script lang="ts">
	import { defaultGroup, type Group } from '$lib';
	import { slide } from 'svelte/transition';

	type Props = {
		newGroupMenuOpen: boolean;
		addNewGroup: (newGroup: Group) => void;
	};

	let { newGroupMenuOpen = $bindable(), addNewGroup }: Props = $props();

	let newGroup = $state(defaultGroup());
	let errorMessage: string = $state('');

	const validateGroup = (group: Group): boolean => {
		if (!group.name.trim()) {
			errorMessage = 'Group name cannot be empty.';
			return false;
		}
		if (group.budget <= 0) {
			errorMessage = 'Budget must be greater than zero.';
			return false;
		}
		errorMessage = ''; // Clear error message if validation passes
		return true;
	};

	const handleCreate = () => {
		if (!validateGroup(newGroup)) {
			return;
		}
		addNewGroup(newGroup);
		newGroup = defaultGroup();
		newGroupMenuOpen = false;
	};
</script>

{#if newGroupMenuOpen}
	<div class="container" transition:slide>
		<div class="card">
			<h3>New Expenses Group</h3>
			<div class="card-content">
				<div class="input-container">
					<label for="name">Name</label>
					<input id="name" type="text" bind:value={newGroup.name} placeholder="Name of the group" />
				</div>
				<div class="input-container">
					<label for="description">Description</label>
					<textarea
						id="description"
						bind:value={newGroup.description}
						placeholder="What is this group for? (optional)"
					></textarea>
				</div>
				<div class="input-container">
					<label for="budget">Budget</label>
					<div class="amount-input-wrapper">
						<span>$</span>
						<input id="budget" type="number" bind:value={newGroup.budget} placeholder="0.00" />
					</div>
				</div>
				{#if errorMessage}
					<p class="error-message">{errorMessage}</p>
				{/if}
				<div class="buttons">
					<button class="cancel-button" onclick={() => (newGroupMenuOpen = false)}>Cancel</button>
					<button class="add-button" onclick={handleCreate}>Create Group</button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.container {
		position: fixed;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--background-color);
		z-index: 999;
	}
	.card {
		padding: 2rem;
		border-radius: 8px;
		width: 100%;
		margin-inline: auto;
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
		justify-content: flex-end;
		gap: 1rem;
		margin-top: 1rem;
	}

	button {
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 500;
		border: none;
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

	.error-message {
		color: red;
		text-align: center;
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

	.amount-input-wrapper input#budget {
		padding: 0.75rem 0;
	}
</style>
