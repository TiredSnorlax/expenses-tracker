<script lang="ts">
	import { onMount } from 'svelte';
	import Tesseract from 'tesseract.js';
	import type { Scheduler } from 'tesseract.js';
	import ReceiptPreview from '$lib/components/ReceiptPreview.svelte';
	import { GoogleGenAI } from '@google/genai';
	import {
		getPromptResponse,
		getReceiptFromResponse,
		getSystemInstruction,
		SAMPLE_RECEIPT,
		type Receipt
	} from '$lib/prompt';
	import { PUBLIC_GEMINI_KEY } from '$env/static/public';
	import { LoaderCircle } from '@lucide/svelte';

	type Props = {
		receipts: (Receipt | null)[];
		nextPage: () => void;
		prevPage: () => void;
	};

	let { receipts = $bindable(), nextPage, prevPage }: Props = $props();

	let scheduler: Scheduler | null = $state(null);

	interface ImagePreview {
		file: File;
		rectangle: { left: number; top: number; width: number; height: number };
	}

	let imagePreviews: ImagePreview[] = $state([]);
	let processedData: string[] = $state([]);

	// Loading States
	let isSetupLoading = $state(false);
	let isScanning = $state(false);
	let isProcessing = $state(false);

	const initScheduler = async () => {
		isSetupLoading = true;
		const newScheduler = Tesseract.createScheduler();
		for (let i = 0; i < 4; i++) {
			const worker = await Tesseract.createWorker('eng', 3, { logger: (m) => console.log(m) });
			newScheduler.addWorker(worker);
		}
		scheduler = newScheduler;
		isSetupLoading = false;
	};

	const handleFileChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		if (!target.files) return;

		const files = Array.from(target.files);
		let loadedFiles = 0;

		files.forEach((file) => {
			const reader = new FileReader();
			reader.onload = (re) => {
				const img = new Image();
				img.onload = () => {
					imagePreviews.push({
						file,
						rectangle: {
							left: 0,
							top: 0,
							width: img.width,
							height: img.height
						}
					});
					loadedFiles++;
				};
				img.src = re.target?.result as string;
			};
			reader.readAsDataURL(file);
		});
	};

	const recognize = async () => {
		if (!scheduler || imagePreviews.length === 0) return;
		isScanning = true;
		try {
			const promises = imagePreviews.map((p) =>
				scheduler!.addJob('recognize', p.file, { rectangle: { ...p.rectangle } })
			);
			const results = await Promise.all(promises);
			results.forEach((res) => {
				processedData.push(res.data.text);
			});
		} catch (error) {
			console.error('Error recognizing files:', error);
		} finally {
			console.log(processedData);
			sendToApiTesting();
			// sendToApi();
		}
		isScanning = false;
	};

	const sendToApi = async () => {
		isProcessing = true;
		receipts = []; // Clear previous responses
		const genAI = new GoogleGenAI({ apiKey: PUBLIC_GEMINI_KEY });
		console.log(genAI.models);

		for (const data of processedData) {
			try {
				const response = await genAI.models.generateContent({
					model: 'gemini-2.5-flash-lite',
					contents: data,
					config: {
						systemInstruction: getSystemInstruction()
					}
				});

				if (response.text) {
					const promptResponse = getPromptResponse(response.text);
					const receipt = getReceiptFromResponse(promptResponse);
					console.log(receipt);
					receipts.push(receipt);
				} else {
					receipts.push(null);
				}
			} catch (error) {
				console.error('Error parsing API response:', error);
				receipts.push(null);
			}
		}

		processedData = [];
		imagePreviews = []; // Clear previews to show the editor list
		console.log('done');

		isProcessing = false;
		// Goes on to the ReceiptExpenseList to confirm data
		nextPage();
	};

	// So that the api doesn't run out of uses
	const sendToApiTesting = () => {
		receipts.push(SAMPLE_RECEIPT);
		nextPage();
	};

	const clearFiles = () => {
		imagePreviews = [];
		processedData = [];
		receipts = [];
	};

	onMount(() => {
		initScheduler();
		return () => {
			scheduler?.terminate();
		};
	});
</script>

<!-- TODO: Use a Page system for this.
Each individual Page will have its own component.
This parent should only be responsible for managing the state and coordinating the flow between the pages. -->
<div class="page-container">
	<h1>Upload your receipts</h1>

	<!-- Loading States -->
	{#if isSetupLoading}
		<div class="loading">
			<span class="spinner"><LoaderCircle /></span>
			<p>Setting up...</p>
		</div>
	{/if}
	{#if isScanning}
		<div class="loading">
			<span class="spinner"><LoaderCircle /></span>
			<p>Scanning...</p>
		</div>
	{/if}
	{#if isProcessing}
		<div class="loading">
			<span class="spinner"><LoaderCircle /></span>
			<p>Processing...</p>
		</div>
	{/if}

	{#if imagePreviews.length > 0}
		<div class="buttons">
			<button class="cancel" onclick={clearFiles}>Clear</button>
			<button class="submit" onclick={recognize}> Recognize Text </button>
		</div>
		<p class="info">Drag the box around the relevant information only</p>
		<div class="previews-container">
			{#each imagePreviews as preview, i (preview.file.name)}
				<div class="preview-card">
					<ReceiptPreview bind:preview={imagePreviews[i]} index={i} />
				</div>
			{/each}
		</div>
	{/if}

	<div class="actions">
		<label for="file-upload" class="file-upload-label"> Select Files </label>
		<input id="file-upload" type="file" accept="image/*" onchange={handleFileChange} multiple />
	</div>
</div>

<style>
	.page-container {
		max-width: 1200px;
		margin: 2rem auto;
		padding: 0 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	.loading .spinner {
		animation: spin 1s linear infinite;
		display: flex;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading p {
		font-size: 1.25rem;
		font-weight: 500;
	}

	h1 {
		text-align: center;
		font-size: 2rem;
		font-weight: 600;
	}

	.actions {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
	}

	input[type='file'] {
		display: none;
	}

	.file-upload-label {
		background-color: var(--primary-color);
		color: var(--text-color);
		border: 1px solid var(--border-color);
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	.file-upload-label:hover {
		background-color: var(--border-color);
	}

	.buttons {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 3rem;
	}

	.buttons button {
		background-color: var(--secondary-color);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 0.5rem;
		cursor: pointer;
		font-weight: 500;
		transition: background-color 0.2s;
	}

	button.cancel {
		background: none;
		border: 1px solid var(--text-color);
	}

	.info {
		font-size: 1.2rem;
		color: var(--text-color);
		text-align: center;
	}

	.previews-container {
		display: flex;
		flex-direction: column;
		align-items: center;

		gap: 1.5rem;
		width: 100%;
	}

	.preview-card {
		background-color: var(--primary-color);
		border: 1px solid var(--border-color);
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}
</style>
