import { writable, type Readable } from 'svelte/store';
import { auth, googleProvider } from '$lib/firebase';
import {
	onAuthStateChanged,
	signInWithPopup,
	signInWithRedirect,
	signOut as firebaseSignOut,
	type User,
	type UserCredential
} from 'firebase/auth';
import { browser } from '$app/environment';

// Type for the user data we store
export interface AuthUser {
	uid: string;
	email: string | null;
	displayName: string | null;
	photoURL: string | null;
	emailVerified: boolean;
}

// Type for the auth store state
export interface AuthState {
	user: AuthUser | null;
	loading: boolean;
	error: string | null;
}

// Type for the auth store with custom methods
export interface AuthStore extends Readable<AuthState> {
	setError: (error: string) => void;
	clearError: () => void;
}

const createAuthStore = (): AuthStore => {
	// Init store
	const { subscribe, set, update } = writable<AuthState>({
		user: null,
		loading: true,
		error: null
	});

	if (browser && auth) {
		// Listen to authentication state changes (firebase)
		onAuthStateChanged(auth, (firebaseUser: User | null) => {
			// Set store when auth changes
			set({
				user: firebaseUser
					? {
							uid: firebaseUser.uid,
							email: firebaseUser.email,
							displayName: firebaseUser.displayName,
							photoURL: firebaseUser.photoURL,
							emailVerified: firebaseUser.emailVerified
						}
					: null,
				loading: false,
				error: null
			});
		});
	}

	// Returns helper methods
	return {
		subscribe,
		setError: (error: string) => {
			set({ user: null, loading: false, error });
		},
		clearError: () => {
			update((state) => ({ ...state, error: null }));
		}
	};
};

export const authStore = createAuthStore();

export const signInWithGoogle = async () => {
	if (!auth || !googleProvider) throw new Error('Firebase auth not initialized');

	try {
		// Use popup for desktop, redirect for mobile
		if (window.innerWidth < 768) {
			await signInWithRedirect(auth, googleProvider);
			// Redirect doesn't return a value immediately
			return;
		} else {
			const result: UserCredential = await signInWithPopup(auth, googleProvider);
			return result.user;
		}
	} catch (error) {
		console.error('Sign-in error:', error);
		throw error;
	}
};

export const signOut = async (): Promise<void> => {
	if (!auth) {
		throw new Error('Firebase auth not initialized');
	}

	try {
		await firebaseSignOut(auth);
	} catch (error) {
		console.error('Sign-out error:', error);
		throw error;
	}
};
