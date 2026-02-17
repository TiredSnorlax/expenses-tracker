<script lang="ts">
	import type { Expense, Profile } from '$lib';
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';

	import { ChevronLeft, ChevronRight } from '@lucide/svelte';

	type Props = {
		currentDate: Date;
		expenses: Expense[];
		profile: Profile;
	};

	let { currentDate = $bindable(), expenses = $bindable(), profile }: Props = $props();

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
	let remainingBudget = $derived(profile.monthlyBudget - totalSpent);

	const updateChart = () => {
		if (!chart) return;
		const backgroundColors = generateChartColors(expensesByCategory.size);
		const borderColors = backgroundColors.map((c) => c.replace('0.8', '1'));
		chart.data.labels = [...expensesByCategory.keys(), 'Unspent'];
		chart.data.datasets[0].data = [
			...expensesByCategory.values(),
			profile.monthlyBudget - totalSpent
		];
		chart.data.datasets[0].backgroundColor = backgroundColors;
		chart.data.datasets[0].borderColor = borderColors;
		chart.update();
	};

	const plotChart = (
		expenses: Expense[],
		expensesByCategory: Map<string, number>,
		totalSpent: number
	) => {
		const ctx = chartCanvas.getContext('2d');
		if (!ctx) return;
		if (chart) {
			updateChart();
		} else {
			const backgroundColors = generateChartColors(expensesByCategory.size);
			const borderColors = backgroundColors.map((c) => c.replace('0.8', '1'));
			chart = new Chart(ctx, {
				type: 'pie',
				data: {
					labels: [...expensesByCategory.keys(), 'Unspent'],
					datasets: [
						{
							label: 'Expense Breakdown',
							data: [...expensesByCategory.values(), remainingBudget],
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
							text: 'Monthly Expense Breakdown'
						}
					}
				}
			});
		}
	};

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

	onMount(() => {
		Chart.register(...registerables);
	});

	$effect(() => {
		plotChart(expenses, expensesByCategory, totalSpent);
	});
</script>

<section class="date">
	<button onclick={decrementMonth}><ChevronLeft /></button>
	{#key currentDate}
		<h2>{displayDate()}</h2>
	{/key}
	<button onclick={incrementMonth}><ChevronRight /></button>
</section>

<section class="overview">
	<div class="budget-info">
		<h2>Monthly Budget</h2>
		<p class="amount">S${profile.monthlyBudget.toFixed(2)}</p>
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
</style>
