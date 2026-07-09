import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Node 24+ exposes a global `localStorage` that is undefined unless
// --localstorage-file is set, which shadows jsdom's window.localStorage.
// Provide an in-memory polyfill on both window and globalThis.
{
	class MemoryStorage implements Storage {
		private store = new Map<string, string>();
		get length() {
			return this.store.size;
		}
		key(index: number) {
			return Array.from(this.store.keys())[index] ?? null;
		}
		getItem(key: string) {
			return this.store.has(key) ? (this.store.get(key) as string) : null;
		}
		setItem(key: string, value: string) {
			this.store.set(key, String(value));
		}
		removeItem(key: string) {
			this.store.delete(key);
		}
		clear() {
			this.store.clear();
		}
	}
	const storage = new MemoryStorage();
	Object.defineProperty(globalThis, "localStorage", {
		configurable: true,
		writable: true,
		value: storage,
	});
	if (typeof window !== "undefined") {
		Object.defineProperty(window, "localStorage", {
			configurable: true,
			writable: true,
			value: storage,
		});
	}
}

afterEach(() => {
	cleanup();
});
