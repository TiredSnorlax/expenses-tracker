export const getSystemInstruction = () => {
	return `
	You are a structured data extraction engine.
  Your task is to extract normalized receipt data from raw receipt text and return it in the exact JSON format defined below.

  Rules (must follow all):
  - Output MUST be valid JSON only.
  - Do NOT include markdown, code fences, comments, or extra text.
  - Do NOT include keys not defined in the schema.
  - If information is missing or cannot be confidently determined, use null or an empty array.
  - Do NOT invent items, add-ons, taxes, or values not present in the receipt.

  Required JSON schema:
  {
    "name": string,
    "total": number | null,
    "category": string | null,
    "taxes": [
      {
        "name": string,
        "percentage": number,
        "inclusive": true
      }
    ],
    "items": [
      {
        "name": string,
        "quantity": number,
        "unit_price": number,
        "add_ons": [
          {
            "name": string,
            "price": number
          }
        ]
      }
    ]
  }

  Extraction rules:
  - "name" is the merchant or store name.
  - "category" is a high-level classification (e.g. "food", "beverages", "retail"). Use null if unclear.
  - "total" must be the final amount paid.
  - Taxes must only include explicitly listed taxes.
  - "inclusive" must always be true.
  - Quantity defaults to 1 if not specified.
  - Unit price must be per-item, not line total.
  - Add-ons are modifiers explicitly attached to an item (e.g. toppings, upgrades).
  - These add-ons may be found on the next few lines after an item.
  - If no add-ons exist for an item, return an empty array.
  - Ignore payment methods, order numbers, subtotals, discounts, tips, and loyalty points.
`;
};

export const SAMPLE_RESPONSE: PromptResponse = {
	name: 'Nine Fresh',
	total: 8.1,
	category: 'food',
	taxes: [
		{
			name: 'GST',
			percentage: 9,
			inclusive: true
		}
	],
	items: [
		{
			name: 'Jasmine Tropical Ai-Yu B (6 Taro Balls)',
			quantity: 1,
			unit_price: 4.5,
			add_ons: []
		},
		{
			name: 'Nine Fresh Signature (6 Taro Balls)',
			quantity: 1,
			unit_price: 3.6,
			add_ons: [
				{
					name: 'No Bean Curd S',
					price: 0
				},
				{
					name: 'Soft Peanuts - P',
					price: 0
				}
			]
		}
	]
};

export const SAMPLE_RECEIPT: Receipt = {
	split: 1,
	name: 'Nine Fresh',
	total: 8.1,
	category: 'food',
	taxes: [
		{
			name: 'GST',
			percentage: 9,
			inclusive: true
		}
	],
	items: [
		{
			name: 'Jasmine Tropical Ai-Yu B (6 Taro Balls)',
			quantity: 1,
			unit_price: 4.5,
			add_ons: []
		},
		{
			name: 'Nine Fresh Signature (6 Taro Balls)',
			quantity: 1,
			unit_price: 3.6,
			add_ons: [
				{
					name: 'No Bean Curd S',
					price: 0
				},
				{
					name: 'Soft Peanuts - P',
					price: 0
				}
			]
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
		add_ons: {
			name: string;
			price: number;
		}[];
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
		add_ons: {
			name: string;
			price: number;
		}[];
	}[];
}
