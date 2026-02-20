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
  - Quantity defaults to 1 if not specified.
  - Unit price must be per-item, not line total.
  - Ignore payment methods, order numbers, subtotals, discounts, tips, and loyalty points.


  Add-on Rules:
  - An add-on is a modifier, customization, or supplement tied to a parent item, not a standalone purchase.
  - Classify a line as an add-on if ANY of the following apply:
      - It is indented under the line above it.
      - It is prefixed with a symbol (+, *, -, >).
      - Its name implies a modifier or customization (e.g. "Extra X", "No X", "Add X", "Sub X", "Upsize").
      - It has no standalone meaning without the item above it (e.g. "Oat Milk" after "Latte").
      - It lacks its own quantity and only makes sense in context.
  - A line is an add-on if it logically belongs to the item above it AND any of these apply:
      - It has a 0.00 price and is a component or customization of the parent.
      - It is priced lower than the parent and only makes sense in its context.
      - The parent is a bundle (e.g. "Meal", "Set", "Combo") — treat all subsequent component lines as add-ons until the next standalone item.
  - Do not use price alone as the signal — context must support the relationship.
  - Never list add-ons as standalone items. Always nest them in the parent item's add_ons array.
  - When ambiguous, prefer treating a line as an add-on if it directly follows a related item.
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
