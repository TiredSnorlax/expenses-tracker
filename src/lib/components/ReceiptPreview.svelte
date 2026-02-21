<script lang="ts">
	import { onMount } from 'svelte';

	type Rectangle = { left: number; top: number; width: number; height: number };

	interface ImagePreview {
		file: File;
		rectangle: { left: number; top: number; width: number; height: number };
		resultText?: string;
	}

	type Props = {
		preview: ImagePreview;
		index: number;
	};

	let { preview = $bindable(), index }: Props = $props();

	let canvas: HTMLCanvasElement;
	let previewImg: HTMLImageElement | null = $state(null);
	let dataURL = $state('');

	// Dragging state
	let dragHandle: 'tl' | 'tr' | 'bl' | 'br' | 'body' | null = $state(null);
	let dragStart = { x: 0, y: 0 };
	let initialRectangle: Rectangle | null = null;

	let handleSize = 20;
	let scaleFactorX = $state(1);
	let scaleFactorY = $state(1);
	let imgWidth = 0;
	let imgHeight = 0;

	const load = () => {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const img = new Image();
		img.onload = () => {
			imgWidth = img.width;
			imgHeight = img.height;

			canvas.width = img.width;
			canvas.height = img.height;

			let minHandleSize = Math.floor(img.width * 0.02);
			if (handleSize < minHandleSize) handleSize = minHandleSize;

			preview.rectangle.left = minHandleSize;
			preview.rectangle.top = minHandleSize;
			preview.rectangle.width = imgWidth - 2 * minHandleSize;
			preview.rectangle.height = imgHeight - 2 * minHandleSize;

			ctx.drawImage(img, 0, 0);
			drawRectangle(ctx, preview.rectangle);

			previewImg = img;
		};
		img.src = dataURL;
	};

	const draw = () => {
		if (!canvas || !previewImg) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		console.log('draw');

		ctx.drawImage(previewImg, 0, 0);
		drawRectangle(ctx, preview.rectangle);
	};

	const drawCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, Math.PI * 2);
		ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
		ctx.fill();
		ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
		ctx.lineWidth = 2;
		ctx.stroke();
	};

	const drawRectangle = (ctx: CanvasRenderingContext2D, rect: Rectangle) => {
		const { left, top, width, height } = rect;
		ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
		ctx.lineWidth = 3;
		ctx.strokeRect(left, top, width, height);

		ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
		const handleRadius = handleSize / 2;
		drawCircle(ctx, left, top, handleRadius);
		drawCircle(ctx, left + width, top, handleRadius);
		drawCircle(ctx, left, top + height, handleRadius);
		drawCircle(ctx, left + width, top + height, handleRadius);
	};

	const getHandleAt = (rect: Rectangle, x: number, y: number) => {
		const { left, top, width, height } = rect;
		const hr = handleSize / 2;
		console.log(x, y);
		console.log(left, top, width, height, hr);
		if (x >= left - hr && x <= left + hr && y >= top - hr && y <= top + hr) return 'tl';
		if (x >= left + width - hr && x <= left + width + hr && y >= top - hr && y <= top + hr)
			return 'tr';
		if (x >= left - hr && x <= left + hr && y >= top + height - hr && y <= top + height + hr)
			return 'bl';
		if (
			x >= left + width - hr &&
			x <= left + width + hr &&
			y >= top + height - hr &&
			y <= top + height + hr
		)
			return 'br';
		if (x >= left && x <= left + width && y >= top && y <= top + height) return 'body';
		return null;
	};

	const onMouseDown = (e: MouseEvent) => {
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();

		scaleFactorX = imgWidth / rect.width;
		scaleFactorY = imgHeight / rect.height;

		console.log(rect);
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		const scaledX = x * scaleFactorX;
		const scaledY = y * scaleFactorY;

		const handle = getHandleAt(preview.rectangle, scaledX, scaledY);
		console.log(handle);

		if (handle) {
			// Handle cursor styling
			if (handle === 'body') {
				canvas.style.cursor = 'move';
			} else if (handle !== null) {
				canvas.style.cursor = 'crosshair';
			}
			dragHandle = handle;
			dragStart = { x: scaledX, y: scaledY };
			initialRectangle = { ...preview.rectangle };
		}
	};

	const onMouseMove = (e: MouseEvent) => {
		if (!canvas) return;
		if (!dragHandle || !initialRectangle) return;
		console.log('move');
		const rect = canvas.getBoundingClientRect();
		const dx = (e.clientX - rect.left) * scaleFactorX - dragStart.x;
		const dy = (e.clientY - rect.top) * scaleFactorY - dragStart.y;

		let newRect = { ...initialRectangle };

		if (dragHandle === 'tl') {
			newRect.left += dx;
			newRect.top += dy;
			newRect.width -= dx;
			newRect.height -= dy;
		} else if (dragHandle === 'tr') {
			newRect.top += dy;
			newRect.width += dx;
			newRect.height -= dy;
		} else if (dragHandle === 'bl') {
			newRect.left += dx;
			newRect.width -= dx;
			newRect.height += dy;
		} else if (dragHandle === 'br') {
			newRect.width += dx;
			newRect.height += dy;
		} else if (dragHandle === 'body') {
			newRect.left += dx;
			newRect.top += dy;
		}

		preview.rectangle = newRect;
		draw();
	};

	const onMouseUp = () => {
		dragHandle = null;
		initialRectangle = null;

		// Reset cursor style
		canvas.style.cursor = 'default';
	};

	const onTouchStart = (e: TouchEvent) => {
		if (!canvas) return;
		if (e.touches.length > 1) return;

		const rect = canvas.getBoundingClientRect();

		scaleFactorX = imgWidth / rect.width;
		scaleFactorY = imgHeight / rect.height;

		const touch = e.touches[0];
		const x = touch.clientX - rect.left;
		const y = touch.clientY - rect.top;
		const scaledX = x * scaleFactorX;
		const scaledY = y * scaleFactorY;

		const handle = getHandleAt(preview.rectangle, scaledX, scaledY);

		if (handle) {
			if (e.cancelable) e.preventDefault();
			dragHandle = handle;
			dragStart = { x: scaledX, y: scaledY };
			initialRectangle = { ...preview.rectangle };
		}
	};

	const onTouchMove = (e: TouchEvent) => {
		if (!canvas) return;
		if (!dragHandle || !initialRectangle) return;

		if (e.cancelable) e.preventDefault();

		const rect = canvas.getBoundingClientRect();
		const touch = e.touches[0];
		const dx = (touch.clientX - rect.left) * scaleFactorX - dragStart.x;
		const dy = (touch.clientY - rect.top) * scaleFactorY - dragStart.y;

		let newRect = { ...initialRectangle };

		if (dragHandle === 'tl') {
			newRect.left += dx;
			newRect.top += dy;
			newRect.width -= dx;
			newRect.height -= dy;
		} else if (dragHandle === 'tr') {
			newRect.top += dy;
			newRect.width += dx;
			newRect.height -= dy;
		} else if (dragHandle === 'bl') {
			newRect.left += dx;
			newRect.width -= dx;
			newRect.height += dy;
		} else if (dragHandle === 'br') {
			newRect.width += dx;
			newRect.height += dy;
		} else if (dragHandle === 'body') {
			newRect.left += dx;
			newRect.top += dy;
		}

		preview.rectangle = newRect;
		draw();
	};

	const onTouchEnd = (e: TouchEvent) => {
		if (dragHandle) {
			if (e.cancelable) e.preventDefault();
		}
		dragHandle = null;
		initialRectangle = null;
	};

	onMount(() => {
		const reader = new FileReader();
		reader.onload = (e) => {
			dataURL = e.target?.result as string;
		};
		reader.readAsDataURL(preview.file);

		canvas.addEventListener('mousemove', onMouseMove);
		canvas.addEventListener('mouseup', onMouseUp);

		canvas.addEventListener('touchstart', onTouchStart, { passive: false });
		canvas.addEventListener('touchmove', onTouchMove, { passive: false });
		canvas.addEventListener('touchend', onTouchEnd);

		return () => {
			canvas.removeEventListener('mousemove', onMouseMove);
			canvas.removeEventListener('mouseup', onMouseUp);

			canvas.removeEventListener('touchstart', onTouchStart);
			canvas.removeEventListener('touchmove', onTouchMove);
			canvas.removeEventListener('touchend', onTouchEnd);
		};
	});

	$effect(() => {
		if (dataURL && canvas) {
			load();
		}
	});
</script>

<h3>Receipt {index + 1}:</h3>
<canvas bind:this={canvas} onmousedown={onMouseDown}></canvas>

<style>
	canvas {
		flex: 1 1 auto;
		max-width: 700px;
		width: 100%;
		height: 100%;
	}
</style>
