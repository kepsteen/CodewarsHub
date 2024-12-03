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

	const { data, error } = await supabase.auth.signInWithOAuth({
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

	if (error || !data.url) {
		throw new Error("Failed to get authorization URL");
	}

	return new Promise((resolve, reject) => {
		chrome.identity.launchWebAuthFlow(
			{
				url: data.url,
				interactive: true,
			},
			async (callbackUrl) => {
				if (chrome.runtime.lastError || !callbackUrl) {
					reject(
						chrome.runtime.lastError || new Error("Failed to get redirect URL")
					);
					return;
				}

				try {
					const hashParams = new URLSearchParams(callbackUrl.split("#")[1]);
					const access_token = hashParams.get("access_token");
					const refresh_token = hashParams.get("refresh_token");
					const provider_token = hashParams.get("provider_token");

					if (!access_token || !refresh_token || !provider_token) {
						reject(new Error("Missing required tokens"));
						return;
					}

					const { data: sessionData, error: sessionError } =
						await supabase.auth.setSession({
							access_token,
							refresh_token,
						});

					if (sessionError || !sessionData.session) {
						reject(sessionError || new Error("No session returned"));
						return;
					}

					resolve({
						session: sessionData.session,
						providerToken: provider_token,
					});
				} catch (error) {
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
