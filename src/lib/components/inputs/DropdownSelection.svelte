<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	type Props = {
		name: string;
		options: string[];
		value: string;
	};

	let { name, options, value = $bindable() }: Props = $props();

	let showDropdown = $state(false);
	// svelte-ignore state_referenced_locally
	let filteredOptions = $state([...options]);
	let rootNode: HTMLElement;

	const handleInput = (event: Event) => {
		const inputValue = (event.target as HTMLInputElement).value;
		value = inputValue;
		if (inputValue) {
			filteredOptions = options.filter((option) =>
				option.toLowerCase().includes(inputValue.toLowerCase())
			);
		} else {
			filteredOptions = [...options];
		}
		showDropdown = true;
	};

	const selectOption = (option: string) => {
		value = option;
		showDropdown = false;
	};

	const handleFocus = () => {
		filteredOptions = [...options];
		showDropdown = true;
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (rootNode && !rootNode.contains(event.target as Node)) {
			showDropdown = false;
		}
	};

	onMount(() => {
		window.addEventListener('click', handleClickOutside, true);
	});

	onDestroy(() => {
		window.removeEventListener('click', handleClickOutside, true);
	});
</script>

<div class="input-container" bind:this={rootNode}>
	<label for={name}>{name}</label>
	<input
		type="text"
		id={name}
		bind:value
		oninput={handleInput}
		onfocus={handleFocus}
		placeholder="Type to search..."
		autocomplete="off"
	/>
	{#if showDropdown && filteredOptions.length > 0}
		<ul class="dropdown">
			{#each filteredOptions as option}
				<li>
					<button onclick={() => selectOption(option)}>
						{option}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.input-container {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-size: 1.1rem;
		color: var(--subtle-text-color);
	}

	input {
		background-color: var(--primary-color);
		color: var(--text-color);
		border: 1px solid var(--border-color);
		padding: 0.75rem;
		border-radius: 4px;
		font-size: 1rem;
		font-family: inherit;
		width: 100%;
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background-color: var(--primary-color);
		border: 1px solid var(--border-color);
		border-top: none;
		border-radius: 0 0 4px 4px;
		list-style: none;
		padding: 0;
		margin: 0;
		z-index: 10;
		max-height: 200px;
		overflow-y: auto;
	}

	.dropdown li button {
		width: 100%;
		background: none;
		padding: 0.75rem;
		cursor: pointer;
		text-align: start;
		color: var(--text-color);

		border: none;
		outline: none;
	}

	.dropdown li button:hover {
		background-color: var(--secondary-color);
	}
</style>
