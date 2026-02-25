import { Timestamp } from 'firebase/firestore';

export interface Profile {
	monthlyBudget: number;
	// List of Expense Ids
	expenses: string[];
	groups: string[];
}

export interface Group {
	id: string;
	profileId: string;
	name: string;
	description: string;
	budget: number;
	spent: number;
	expenses: string[];
}

export const defaultGroup = () => {
	return {
		id: '',
		profileId: '0',
		name: '',
		description: '',
		budget: 0,
		spent: 0,
		expenses: []
	} as Group;
};

export interface Expense {
	id: string;
	profileId: string;
	groupId: string | null;
	title: string;
	description: string;
	category: string;
	amount: number;
	timestamp: Timestamp;
}

export const createNewExpense = () => {
	// Id will be set when it is added into firestore
	const id = '';
	const timestamp = Timestamp.now();
	const amount = 0;
	const category = '';
	const title = '';
	const description = '';
	const groupId = null;

	return {
		id,
		timestamp,
		amount,
		category,
		title,
		description,
		profileId: '0',
		groupId
	} as Expense;
};

export const formatDate = (date: Date) => {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(date);
};

export const defaultExpenses = (): Expense[] => {
	return [
		{
			id: '1',
			profileId: '1',
			groupId: null,
			title: 'Groceries',
			description: 'Weekly grocery shopping at the local supermarket.',
			category: 'Food',
			amount: 75.5,
			timestamp: Timestamp.fromDate(new Date('2026-02-05'))
		},
		{
			id: '2',
			profileId: '1',
			groupId: null,
			title: 'Train ticket',
			description: 'Monthly pass for public transport.',
			category: 'Transport',
			amount: 32.0,
			timestamp: Timestamp.fromDate(new Date('2026-02-04'))
		},
		{
			id: '3',
			profileId: '1',
			groupId: null,
			title: 'Lunch with colleagues',
			description: 'Team lunch at the new Italian restaurant.',
			category: 'Food',
			amount: 25.0,
			timestamp: Timestamp.fromDate(new Date('2026-02-03'))
		},
		{
			id: '4',
			profileId: '1',
			groupId: null,
			title: 'New headphones',
			description: 'Noise-cancelling headphones for the office.',
			category: 'Entertainment',
			amount: 150.0,
			timestamp: Timestamp.fromDate(new Date('2026-02-02'))
		},
		{
			id: '5',
			profileId: '1',
			groupId: null,
			title: 'Bus fare',
			description: 'One-way ticket to the city center.',
			category: 'Transport',
			amount: 5.5,
			timestamp: Timestamp.fromDate(new Date('2026-02-01'))
		}
	];
};

export const isWithinSameMonth = (date1: Date, date2: Date) => {
	return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
};

export enum SortBy {
	Date = 'Date',
	Price = 'Price'
}

export enum SortDirection {
	Ascending,
	Descending
}
