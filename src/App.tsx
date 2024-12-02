import { useEffect, useState } from "react";
import "./App.css";
import { createClient, Session } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { getEnvVar } from "./lib/utils/env";

const supabase = createClient(
	getEnvVar("SUPABASE_URL"),
	getEnvVar("SUPABASE_ANON_KEY")
);

export default function App() {
	const [session, setSession] = useState<Session | null>(null);
	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => subscription.unsubscribe();
	}, []);

	if (!session) {
		return (
			<Auth
				supabaseClient={supabase}
				appearance={{ theme: ThemeSupa }}
				providers={["github"]}
				onlyThirdPartyProviders
			/>
		);
	} else {
		return <div>Logged in!</div>;
	}
}
