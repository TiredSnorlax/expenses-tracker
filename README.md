# Expense Tracker

A web application built with SvelteKit for managing personal and group expenses, featuring automated receipt parsing powered by Gemini AI.

## Receipt Parsing

The application uses the Gemini 2.5 Flash Lite model to convert raw receipt text into structured data. It identifies and extracts the following information:

- Merchant information (name and category)
- Transaction totals and taxes
- Itemized lists including quantities and unit prices
- Nested add-ons and modifiers associated with specific items

## Tech Stack

- Frontend: SvelteKit, TypeScript, Vanilla CSS
- Backend: SvelteKit API Routes
- AI: Google Gemini AI (Generative Language API)
- Database/Auth: Firebase

## Development

Install dependencies:
```sh
npm install
```

Configure environment variables:
Create a `.env` file in the root directory and add your Gemini API key:
```
GEMINI_KEY=your_api_key_here
```

Start the development server:
```sh
npm run dev
```

## Building

To create a production version:
```sh
npm run build
```
