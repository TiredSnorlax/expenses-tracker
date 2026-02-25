<script lang="ts">
	import type { Expense, Profile } from '$lib';
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';

	type Props = {
		currentDate: Date;
		expenses: Expense[];
		budget: number;
		isGroup?: boolean;
		groupName?: string;
	};

	let { currentDate, expenses = $bindable(), budget, isGroup = false, groupName }: Props = $props();

	let chartCanvas: HTMLCanvasElement;
	let chart: Chart | null = $state(null);

	const getExpensesByCategory = (list: Expense[]) => {
		let out = new Map<string, number>();
		for (const expense of list) {
			const catExpense = out.get(expense.category);
			if (!catExpense) {
				out.set(expense.category, expense.amount);
			} else {
				out.set(expense.category, catExpense + expense.amount);
			}
		}
		return out;
	};

	const generateChartColors = (n: number): string[] => {
		const colors: string[] = [];
		const saturation = 60;
		const lightness = 50;
		const alpha = 0.8;

		for (let i = 0; i < n; i++) {
			const hue = (i * 360) / (n + 1);
			colors.push(`hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`);
		}

		// Add green color at the end
		colors.push('hsla(120, 80%, 65%, 0.8)');
		return colors;
	};

	let expensesByCategory: Map<string, number> = $derived(getExpensesByCategory(expenses));

	let totalSpent = $derived(expenses.reduce((sum, expense) => sum + expense.amount, 0));
	let remainingBudget = $derived(budget - totalSpent);

	const updateChart = () => {
		if (!chart) return;
		const backgroundColors = generateChartColors(expensesByCategory.size);
		const borderColors = backgroundColors.map((c) => c.replace('0.8', '1'));

		chart.data.labels = [...expensesByCategory.keys(), 'Unspent'];
		chart.data.datasets[0].data = [...expensesByCategory.values(), remainingBudget];

		chart.data.datasets[0].backgroundColor = backgroundColors;
		chart.data.datasets[0].borderColor = borderColors;
		chart.update();
	};

	const plotChart = (expensesByCategory: Map<string, number>) => {
		const ctx = chartCanvas.getContext('2d');
		if (!ctx) return;
		if (chart) {
			updateChart();
		} else {
			const backgroundColors = generateChartColors(expensesByCategory.size);
			const borderColors = backgroundColors.map((c) => c.replace('0.8', '1'));

			let labels: string[];
			let data: number[];
			let title: string;

			if (isGroup && groupName) {
				title = `Monthly Expense Breakdown for ${groupName}`;
			} else {
				title = 'Monthly Expense Breakdown';
			}
			labels = [...expensesByCategory.keys(), 'Unspent'];
			data = [...expensesByCategory.values(), remainingBudget];

			chart = new Chart(ctx, {
				type: 'pie',
				data: {
					labels: labels,
					datasets: [
						{
							label: 'Expense Breakdown',
							data: data,
							backgroundColor: backgroundColors,
							borderColor: borderColors,
							borderWidth: 1
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							position: 'top'
						},
						title: {
							display: true,
							text: title
						}
					}
				}
			});
		}
	};

	onMount(() => {
		Chart.register(...registerables);
	});

	$effect(() => {
		plotChart(expensesByCategory);
	});
</script>

<section class="overview">
	<div class="budget-info">
		{#if isGroup && groupName}
			<h2>Total Budget</h2>
		{:else}
			<h2>Monthly Budget</h2>
		{/if}
		<p class="amount">S${budget.toFixed(2)}</p>
	</div>
	<div class="budget-info">
		<h2>Remaining Budget</h2>
		<p class="amount remaining" class:negative={remainingBudget <= 0}>
			S${remainingBudget.toFixed(2)}
		</p>
	</div>
</section>

<section class="chart-container">
	<canvas bind:this={chartCanvas}></canvas>
</section>

<style>
	.overview {
		display: flex;
		justify-content: space-around;
		background-color: var(--primary-color);
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		border: 1px solid var(--border-color);
	}

	.budget-info {
		text-align: center;
	}

	.budget-info h2 {
		margin: 0 0 0.5rem 0;
		color: var(--subtle-text-color);
		font-size: 1.1rem;
		font-weight: 500;
	}

	.budget-info .amount {
		margin: 0;
		font-size: 2rem;
		font-weight: bold;
		color: var(--text-color);
	}

	.budget-info .remaining {
		color: var(--text-color);
	}

	.remaining.negative {
		color: red;
	}

	.chart-container {
		position: relative;
		height: 40vh;
		max-height: 400px;
		background-color: var(--primary-color);
		padding: 1.5rem;
		border-radius: 8px;
		margin-bottom: 2rem;
		border: 1px solid var(--border-color);
	}

	@media (max-width: 600px) {
		.overview {
			padding-inline: 0.5rem;
		}

		.budget-info h2 {
			font-size: 1rem;
		}

		.budget-info .amount {
			margin: 0;
			font-size: 1.8rem;
			font-weight: bold;
			color: var(--text-color);
		}
	}
</style>
