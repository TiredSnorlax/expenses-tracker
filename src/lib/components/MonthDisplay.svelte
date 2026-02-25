<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { fly } from 'svelte/transition';

	type Props = {
		currentDate: Date;
	};
	let { currentDate = $bindable() }: Props = $props();

	const displayDate = () => {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'long'
		}).format(currentDate);
	};

	const incrementMonth = () => {
		currentDate.setMonth(currentDate.getMonth() + 1);
		currentDate = new Date(currentDate);
	};

	const decrementMonth = () => {
		currentDate.setMonth(currentDate.getMonth() - 1);
		currentDate = new Date(currentDate);
	};
</script>

<section class="date">
	<button onclick={decrementMonth}><ChevronLeft /></button>
	<div class="date-text">
		{#key currentDate}
			<h2 in:fly={{ y: 20 }} out:fly={{ y: -20 }}>{displayDate()}</h2>
		{/key}
	</div>
	<button onclick={incrementMonth}><ChevronRight /></button>
</section>

<style>
	button {
		background: none;
		padding: none;
		outline: none;
		border: none;
		color: var(--subtle-text-color);

		display: flex;
		justify-content: center;
		align-items: center;

		cursor: pointer;
	}

	button:hover {
		color: var(--secondary-color);
	}

	.date {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 2rem;
		gap: 1rem;
	}

	.date-text {
		display: grid;
		place-items: center;
		min-width: 200px;
		overflow: hidden;
	}

	.date-text h2 {
		grid-area: 1 / 1;
		margin: 0;
		width: 100%;
		text-align: center;
	}
</style>
