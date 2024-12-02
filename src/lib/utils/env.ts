// utils/env.ts
export const getEnvVar = (key: string): string => {
	// Check if we're in a Chrome extension context
	if (typeof chrome !== "undefined" && chrome.runtime?.getManifest) {
		return chrome.runtime.getManifest().environment[key];
	}
	return import.meta.env[`VITE_${key}`];
};
