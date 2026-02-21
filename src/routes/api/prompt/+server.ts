import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleGenAI } from '@google/genai';
import {
	getPromptResponse,
	getReceiptFromResponse,
	getSystemInstruction,
	type Receipt
} from '$lib/prompt';
import { GEMINI_KEY } from '$env/static/private';

const sendToApi = async (processedData: string[]) => {
	let receipts: (Receipt | null)[] = [];
	const genAI = new GoogleGenAI({ apiKey: GEMINI_KEY });
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
				receipts.push(receipt);
			} else {
				receipts.push(null);
			}
		} catch (error) {
			receipts.push(null);
		}
	}

	return receipts;
};

export const POST: RequestHandler = async ({ request }) => {
	// error(400, 'min and max must be numbers, and min must be less than max');
	const data = await request.json();
	const processedData = data.processedData as string[];
	const receipts = await sendToApi(processedData).catch((err) => {
		console.error('Error sending data to API:', err);
		return error(400, err);
	});

	return new Response(JSON.stringify({ receipts }));
};
