<script lang="ts">
	import { onMount } from 'svelte';
	import { fly, scale, slide } from 'svelte/transition';

	type Props = {
		onApply: (start: { year: number; month: number }, end: { year: number; month: number }) => void;
		startDate: Date;
		endDate: Date;
	};

	let { onApply, startDate, endDate }: Props = $props();

	const MONTHS = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];
	const currentYear = new Date().getFullYear();

	let selectedYear = $state(currentYear);
	let dragging: 'start' | 'end' | null = null;

	let start: { year: number; month: number } = $state({ year: currentYear, month: 0 });
	let end: { year: number; month: number } = $state({ year: currentYear, month: 5 });

	let open = $state(false);

	onMount(() => {
		if (startDate && endDate) {
			start = { year: startDate.getFullYear(), month: startDate.getMonth() };
			end = { year: endDate.getFullYear(), month: endDate.getMonth() };
		}
	});

	// Used to convert months and years to an index for comparison
	const toIndex = (year: number, month: number) => {
		return year * 12 + month;
	};

	const selectMonth = (month: number) => {
		const idx = toIndex(selectedYear, month);
		const startIdx = toIndex(start.year, start.month);
		const endIdx = toIndex(end.year, end.month);

		if (dragging === 'start') {
			if (idx <= endIdx) {
				start = { year: selectedYear, month };
			} else {
				// When the start is dragged over the end => Swap
				start = end;
				end = { year: selectedYear, month };
				dragging = 'end';
			}
		} else if (dragging === 'end') {
			if (idx >= startIdx) {
				end = { year: selectedYear, month };
			} else {
				end = start;
				start = { year: selectedYear, month };
				dragging = 'start';
			}
		} else {
			// No drag active: click nearest handle
			const distStart = Math.abs(idx - startIdx);
			const distEnd = Math.abs(idx - endIdx);
			if (distStart <= distEnd) {
				start = { year: selectedYear, month };
				if (toIndex(start.year, start.month) > endIdx) {
					end = { ...start };
				}
			} else {
				end = { year: selectedYear, month };
				if (toIndex(end.year, end.month) < startIdx) {
					start = { ...end };
				}
			}
		}
	};

	const isInRange = (month: number): boolean => {
		const idx = toIndex(selectedYear, month);
		return idx >= toIndex(start.year, start.month) && idx <= toIndex(end.year, end.month);
	};

	const isStart = (month: number): boolean => {
		return start.year === selectedYear && start.month === month;
	};

	const isEnd = (month: number): boolean => {
		return end.year === selectedYear && end.month === month;
	};

	const formatLabel = (y: number, m: number) => {
		return `${MONTHS[m]} ${y}`;
	};

	// If click the start or end of range => Drag around to select range
	// Else select by clicking
	const handleMouseDown = (month: number) => {
		if (isStart(month)) dragging = 'start';
		else if (isEnd(month)) dragging = 'end';
		else selectMonth(month);
	};

	const handleMouseUp = () => {
		dragging = null;
	};

	const handleMouseEnter = (month: number) => {
		if (dragging) selectMonth(month);
	};

	// Touch handling
	// We dont use a handle mouse equivalent as there is no touch enter.
	const getMonthFromTouch = (e: TouchEvent): number | null => {
		const touch = e.touches[0];
		const el = document.elementFromPoint(touch.clientX, touch.clientY);
		// Uses 'data-month' to find relevant button element
		const btn = el?.closest('[data-month]') as HTMLElement | null;
		if (!btn) return null;
		return parseInt(btn.dataset.month!);
	};

	const handleTouchStart = (month: number) => {
		if (isStart(month)) dragging = 'start';
		else if (isEnd(month)) dragging = 'end';
		else selectMonth(month);
	};

	const handleTouchMove = (e: TouchEvent, i: number) => {
		if (!dragging) return;
		// selectMonth(month);
		const month = getMonthFromTouch(e);
		if (month !== null) selectMonth(month);
	};

	const handleTouchEnd = () => {
		dragging = null;
	};

	const handleSubmit = () => {
		onApply(start, end);
		open = false;
	};
</script>

<svelte:window on:mouseup={handleMouseUp} />

<div class="picker" class:open>
	{#if open}
		<div class="padding" style="height: 1rem" transition:slide></div>
	{/if}
	<button class="summary" onclick={() => (open = !open)}>
		<span class="summary-label">
			{formatLabel(start.year, start.month)}
			<span class="arrow">→</span>
			{formatLabel(end.year, end.month)}
		</span>
	</button>

	{#if open}
		<div class="padding" style="height: 1.5rem" transition:slide></div>
		<!-- Year toggle -->
		<div class="year-nav" transition:slide>
			<button class="year-btn" onclick={() => selectedYear--} aria-label="Previous year">‹</button>
			<span class="year-label">{selectedYear}</span>
			<button class="year-btn" onclick={() => selectedYear++} aria-label="Next year">›</button>
		</div>

		<!-- Range summary -->
		<div class="padding" style="height: 1rem" transition:slide></div>
		<!-- Month grid -->
		<div class="month-grid" role="grid" transition:slide>
			{#each MONTHS as month, i}
				<div
					class="cell-wrap"
					class:in-range={isInRange(i)}
					class:range-start={isStart(i)}
					class:range-end={isEnd(i)}
					role="gridcell"
				>
					<button
						class="month-btn"
						class:start={isStart(i)}
						class:end={isEnd(i)}
						class:in-range={isInRange(i)}
						onmousedown={() => handleMouseDown(i)}
						onmouseenter={() => handleMouseEnter(i)}
						data-month={i}
						ontouchstart={() => handleTouchStart(i)}
						ontouchmove={(e) => handleTouchMove(e, i)}
						ontouchend={handleTouchEnd}
					>
						{month}
					</button>
				</div>
			{/each}
		</div>
		<div class="padding" style="height: 1rem" transition:slide></div>
		<!-- Confirm -->
		<button transition:slide class="confirm-btn" onclick={handleSubmit}>Apply Range</button>
	{/if}
</div>

<style>
	/* ── CSS variables — override these to match your colour scheme ── */
	.picker {
		--radius-sm: 6px;
		--radius-md: 5px;
		--radius-pill: 5px;
	}

	.picker {
		background: var(--secondary-color);
		border: 1px solid var(--border-color);
		border-radius: 1rem;
		padding: 0.5rem;
		width: 250px;
		font-family: 'DM Sans', 'Segoe UI', sans-serif;
		user-select: none;

		transition: all 0.2s ease-in-out;
	}

	.picker span {
		color: white;
		transition: color 0.2s ease-in-out;
	}

	.picker.open {
		background: var(--primary-color);
		border-radius: var(--radius-md);
	}

	.picker.open span {
		color: var(--subtle-text-color);
	}

	/* Summary */
	.summary {
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		width: 100%;

		cursor: pointer;
	}

	.summary-label {
		font-size: 1rem;
		color: var(--subtle-text-color);
		font-weight: 500;
	}

	.arrow {
		margin: 0 6px;
		color: var(--subtle-text-color);
	}

	/* Year nav */
	.year-nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.year-label {
		font-size: 15px;
		font-weight: 600;
		color: var(--text-color);
		letter-spacing: 0.01em;
	}

	.year-btn {
		background: var(--border-color);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-sm);
		color: var(--text-color);
		width: 32px;
		height: 32px;
		display: grid;
		place-items: center;
		font-size: 18px;
		cursor: pointer;
		transition: background 0.15s;
		line-height: 1;
		padding: 0;
	}

	.year-btn:hover {
		background: var(--primary-color);
		border-color: var(--secondary-color);
		color: var(--secondary-color);
	}

	/* Month grid */
	.month-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		touch-action: none;
	}

	/* Cell wrap handles the background band for range */
	.cell-wrap {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 44px;
	}

	.cell-wrap.in-range::before {
		content: '';
		position: absolute;
		inset: 6px 0;
		background: var(--secondary-color);
		opacity: 0.2;
		z-index: 0;
	}

	/* Clip the band at the start and end */
	.cell-wrap.range-start::before {
		border-radius: var(--radius-pill) 0 0 var(--radius-pill);
		left: 50%;
	}

	.cell-wrap.range-end::before {
		border-radius: 0 var(--radius-pill) var(--radius-pill) 0;
		right: 50%;
	}

	/* When start and end are the same cell */
	.cell-wrap.range-start.range-end::before {
		display: none;
	}

	.month-btn {
		position: relative;
		z-index: 1;
		width: 52px;
		height: 34px;
		border-radius: var(--radius-pill);
		border: none;
		background: transparent;
		color: var(--subtle-text-color);
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition:
			background 0.12s,
			color 0.12s,
			transform 0.1s;
	}

	.month-btn:hover {
		background: var(--border-color);
		color: var(--secondary-color);
	}

	.month-btn.in-range {
		color: var(--secondary-color);
		font-weight: 600;
	}

	.month-btn.start,
	.month-btn.end {
		background: var(--secondary-color);
		color: var(--text-color);
		font-weight: 700;
		box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
	}

	.month-btn.start:hover,
	.month-btn.end:hover {
		background: var(--secondary-color);
	}

	/* Confirm button */
	.confirm-btn {
		width: 100%;
		padding: 10px;
		background: var(--secondary-color);
		color: var(--text-color);
		border: none;
		border-radius: var(--radius-sm);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		letter-spacing: 0.02em;
		transition:
			opacity 0.15s,
			transform 0.1s;
	}

	.confirm-btn:hover {
		transform: translateY(-1px);
	}

	.confirm-btn:active {
		background: var(--text-color);
		color: var(--secondary-color);
	}
</style>
