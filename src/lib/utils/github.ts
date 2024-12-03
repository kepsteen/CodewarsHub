export const createGitHubRepo = async (
	isPrivate: boolean,
	token: string,
	username: string
) => {
	const url = "https://api.github.com/user/repos";
	const data = {
		name: "Codewars",
		private: isPrivate,
	};

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `token ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`Error: ${response.statusText}`);
		}

		const repoData = await response.json();
		localStorage.setItem("repo", `${username}/Codewars`);
		return repoData;
	} catch (error) {
		console.error("Error creating repository:", error);
		throw new Error("Failed to create repository");
	}
};
