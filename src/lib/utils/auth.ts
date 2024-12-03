import { createClient, Session } from "@supabase/supabase-js";
import { getEnvVar } from "./env";

export const supabase = createClient(
	getEnvVar("SUPABASE_URL"),
	getEnvVar("SUPABASE_ANON_KEY")
);

export async function signInWithGitHub(): Promise<{
	session: Session;
	providerToken: string;
}> {
	const redirectUrl = `https://${chrome.runtime.id}.chromiumapp.org/`;
	console.log("Starting GitHub sign in with redirect URL:", redirectUrl);

	const { data } = await supabase.auth.signInWithOAuth({
		provider: "github",
		options: {
			skipBrowserRedirect: true,
			redirectTo: redirectUrl,
			scopes: "repo read:user user:email",
			queryParams: {
				access_type: "offline",
			},
		},
	});

	if (!data.url) {
		throw new Error("Failed to get authorization URL");
	}

	// Launch Chrome's OAuth flow
	return new Promise((resolve, reject) => {
		console.log("Launching web auth flow with URL:", data.url);

		chrome.identity.launchWebAuthFlow(
			{
				url: data.url,
				interactive: true,
			},
			async (redirectUrl) => {
				if (chrome.runtime.lastError || !redirectUrl) {
					reject(
						chrome.runtime.lastError || new Error("Failed to get redirect URL")
					);
					return;
				}

				if (!redirectUrl) {
					console.error("No redirect URL received");
					reject(new Error("Failed to get redirect URL"));
					return;
				}

				console.log("Received redirect URL:", redirectUrl);

				try {
					// Extract the fragment parameters
					const hashParams = new URLSearchParams(redirectUrl.split("#")[1]);
					const access_token = hashParams.get("access_token");
					const refresh_token = hashParams.get("refresh_token");
					const provider_token = hashParams.get("provider_token");
					console.log("provider_token", provider_token);

					if (!access_token || !refresh_token) {
						console.error("Missing tokens:", { access_token, refresh_token });
						reject(new Error("Missing required tokens"));
						return;
					}

					if (!provider_token) {
						reject(new Error("No provider token found"));
						return;
					}

					// Exchange the token with Supabase
					const { data: sessionData, error } = await supabase.auth.setSession({
						access_token,
						refresh_token,
					});

					if (error || !sessionData.session) {
						reject(error || new Error("No session returned"));
						return;
					}

					console.log("Successfully created session");
					resolve({
						session: sessionData.session,
						providerToken: provider_token,
					});
				} catch (error) {
					console.error("Error processing auth response:", error);
					reject(error);
				}
			}
		);
	});
}

export const signOut = async () => {
	try {
		const { error } = await supabase.auth.signOut();
		if (error) throw error;
		console.log("Successfully logged out");
	} catch (err) {
		console.error("Error logging out:", err);
	}
};
