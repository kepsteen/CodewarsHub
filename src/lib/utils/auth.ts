import { createClient, Session } from "@supabase/supabase-js";
import { getEnvVar } from "./env";

export const supabase = createClient(
	getEnvVar("SUPABASE_URL"),
	getEnvVar("SUPABASE_ANON_KEY")
);

export async function signInWithGitHub(): Promise<{ session: Session }> {
	const redirectUrl = `https://${chrome.runtime.id}.chromiumapp.org/`;

	const { data } = await supabase.auth.signInWithOAuth({
		provider: "github",
		options: {
			skipBrowserRedirect: true,
			redirectTo: redirectUrl,
			scopes: "repo public_repo",
		},
	});

	if (!data.url) {
		throw new Error("Failed to get authorization URL");
	}

	// Launch Chrome's OAuth flow
	return new Promise((resolve, reject) => {
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

				// Extract the fragment parameters
				const hashParams = new URLSearchParams(redirectUrl.split("#")[1]);
				const access_token = hashParams.get("access_token");
				const refresh_token = hashParams.get("refresh_token");

				if (!access_token) {
					reject(new Error("No access token found"));
					return;
				}
				if (!refresh_token) {
					reject(new Error("No refresh token found"));
					return;
				}

				// Exchange the token with Supabase
				const { data: sessionData, error } = await supabase.auth.setSession({
					access_token,
					refresh_token: refresh_token,
				});

				if (error || !sessionData.session) {
					reject(error || new Error("No session returned"));
					return;
				}

				resolve({ session: sessionData.session });
			}
		);
	});
}
