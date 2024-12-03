import { useEffect, useState } from "react";
import "./App.css";
import { Session } from "@supabase/supabase-js";
import { signInWithGitHub, signOut } from "./lib/utils/auth";
import { supabase } from "./lib/utils/auth";

export default function App() {
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [providerToken, setProviderToken] = useState<string | null>(null);

	useEffect(() => {
		// Check for existing session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setLoading(false);
		});

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => subscription.unsubscribe();
	}, []);

	const handleGitHubLogin = async () => {
		try {
			setLoading(true);
			setError(null);
			const { session, providerToken } = await signInWithGitHub();
			setSession(session);
			setProviderToken(providerToken);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to login");
		} finally {
			setLoading(false);
		}
	};

	if (loading) return <div>Loading...</div>;

	if (!session) {
		return (
			<div>
				<button onClick={handleGitHubLogin} disabled={loading}>
					{loading ? "Loading..." : "Sign in with GitHub"}
				</button>
				{error && <p style={{ color: "red" }}>{error}</p>}
			</div>
		);
	}

	return (
		<>
			<div>Logged in as {session.user.email}</div>
			<div>GitHub token: {providerToken}</div>
			<button onClick={signOut}>Sign out</button>
		</>
	);
}
