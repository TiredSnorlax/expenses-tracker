export const getSystemInstruction = () => {
	return `
  You are a data extraction engine.

  Your task is to extract structured purchase data from raw receipt text.

  Rules:
  - Output MUST be valid JSON only.
  - Do NOT include explanations, comments, or additional text.
  - Do NOT wrap the output in markdown.
  - If a field is missing or cannot be confidently determined, use null.
  - Do NOT invent items that are not present in the receipt.

  JSON schema:
  {
    "total": number,
    "category": string,
    "name": string,
    "taxes" : [
      {
        "name": string,
        "percentage": number,
        "inclusive": boolean,
      }
    ]
    "items": [
      {
        "name": string,
        "quantity": number,
        "unit_price": number
      }
    ]
  }

  Extraction requirements:
  - "total" must be the final amount paid (after tax if present).
  - "category" is what type of expense receipt is for (Must be one capitalised).
  - "name" is what the receipt is for. This can be the company or brand name. (default to an empty string if not confindent)
  - Examples of categories are Food, Entertainment, Transport, etc (default to an empty string if not confident).
  - Each item must represent a purchasable line item.
  - "quantity" must be numeric (default to 1 if not specified).
  - "unit_price" must be the price for a single unit (not line total).
  - "inclusive" is if the tax has already been included into the price of items (default to true)
  - Ignore subtotals, tax lines, discounts, and payment method lines.
  - Normalize prices to decimal numbers (e.g. 3.50).
  - Preserve original item names without rewording.
  - Do not include any comments like \`\`\` json.
`;
};

export const SAMPLE_RESPONSE: PromptResponse = {
	total: 8.1,
	name: 'SAMPLE',
	category: 'Food',
	taxes: [
		{
			name: 'GET (Inclusive 9%)',
			percentage: 9,
			inclusive: true
		}
	],
	items: [
		{
			name: 'Jasmine Tropical Ai- Yu B (6 Taro Balls)',
			quantity: 1,
			unit_price: 4.5
		},
		{
			name: 'Nine Fresh Signatu re {6 Taro Balls)',
			quantity: 1,
			unit_price: 3.6
		}
	]
};

export const SAMPLE_RECEIPT: Receipt = {
	name: 'Sample',
	total: 8.1,
	split: 1,
	category: 'Food',
	taxes: [
		{
			name: 'GET (Inclusive 9%)',
			percentage: 9,
			inclusive: true
		}
	],
	items: [
		{
			name: 'Jasmine Tropical Ai- Yu B (6 Taro Balls)',
			quantity: 1,
			unit_price: 4.5
		},
		{
			name: 'Nine Fresh Signatu re {6 Taro Balls)',
			quantity: 1,
			unit_price: 3.6
		}
	]
};

export const getPromptResponse = (raw: string) => {
	let cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
	return JSON.parse(cleaned) as PromptResponse;
};

export const getReceiptFromResponse = (response: PromptResponse) => {
	return {
		split: 1,
		...response
	} as Receipt;
};

export interface PromptResponse {
	name: string;
	total: number;
	category: string;
	taxes: {
		name: string;
		percentage: number;
		inclusive: true;
	}[];
	items: {
		name: string;
		quantity: number;
		unit_price: number;
	}[];
}

export interface Receipt {
	name: string;
	total: number;
	split: number;
	category: string;
	taxes: {
		name: string;
		percentage: number;
		inclusive: true;
	}[];
	items: {
		name: string;
		quantity: number;
		unit_price: number;
	}[];
}
