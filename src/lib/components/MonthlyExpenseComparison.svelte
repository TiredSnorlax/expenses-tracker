<script lang="ts">
	import type { Expense } from '$lib';
	import { Chart, registerables } from 'chart.js';

	type Props = {
		expenses: Expense[];
		startDate: Date;
		endDate: Date;
	};

	let { expenses, startDate, endDate }: Props = $props();

	let chartCanvas: HTMLCanvasElement | null = $state(null);
	let chart: Chart | null = null;

	Chart.register(...registerables);

	const getMonthDiff = (start: Date, end: Date) => {
		return end.getMonth() - start.getMonth() + 12 * (end.getFullYear() - start.getFullYear());
	};

	const processChartData = () => {
		console.log('processing chart data');
		if (!chartCanvas) return;

		if (chart) {
			chart.destroy();
			chart = null;
		}

		const monthlyData: Record<string, Record<string, number>> = {};
		const categories = new Set<string>();

		const getMonthIndex = (date: Date) =>
			`${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

		// Initialize months
		for (let i = 0; i <= getMonthDiff(startDate, endDate); i++) {
			let date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
			monthlyData[getMonthIndex(date)] = {};
		}

		expenses.forEach((expense) => {
			const date = expense.timestamp.toDate();
			const category = expense.category || 'Uncategorized';
			categories.add(category);

			if (!monthlyData[getMonthIndex(date)][category]) {
				monthlyData[getMonthIndex(date)][category] = 0;
			}
			monthlyData[getMonthIndex(date)][category] += expense.amount;
		});

		const labels = Object.keys(monthlyData);

		const categoryList = Array.from(categories);
		const datasets = categoryList.map((category, index) => {
			const data = labels.map((i) => monthlyData[i][category] || 0);
			const hue = (index * 137.508) % 360;
			const color = `hsla(${hue}, 70%, 50%, 0.7)`;
			const borderColor = `hsla(${hue}, 70%, 50%, 1)`;

			return {
				label: category,
				data: data,
				backgroundColor: color,
				borderColor: borderColor,
				borderWidth: 1
			};
		});

		chart = new Chart(chartCanvas, {
			type: 'bar',
			data: {
				labels,
				datasets
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				color: '#a0a0a0',
				scales: {
					x: {
						stacked: true,
						title: {
							display: true,
							text: 'Month',
							color: '#a0a0a0'
						},
						ticks: { color: '#a0a0a0' },
						grid: { color: '#444' }
					},
					y: {
						stacked: true,
						beginAtZero: true,
						title: {
							display: true,
							text: 'Amount',
							color: '#a0a0a0'
						},
						ticks: { color: '#a0a0a0' },
						grid: { color: '#444' }
					}
				},
				plugins: {
					legend: {
						labels: { color: '#a0a0a0' }
					},
					title: {
						display: true,
						text: `Monthly Expenses Breakdown - `,
						color: '#a0a0a0'
					},
					tooltip: {
						mode: 'index',
						intersect: false
					}
				}
			}
		});
	};

	$effect(() => {
		if (expenses.length) processChartData();
	});
</script>

<canvas bind:this={chartCanvas}></canvas>
