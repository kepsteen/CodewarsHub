export const createGitHubRepo = async (
	isPrivate: boolean,
	token: string,
	username: string
) => {
	const repoName = "Codewars";
	const url = "https://api.github.com/user/repos";
	const data = {
		name: repoName,
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

		await response.json();
		const fullRepoName = `${username}/Codewars`;
		localStorage.setItem("repo", fullRepoName);
		return fullRepoName;
	} catch (error) {
		console.error("Error creating repository:", error);
		throw new Error("Failed to create repository");
	}
};
