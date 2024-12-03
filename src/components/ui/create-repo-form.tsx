import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { createGitHubRepo } from "@/lib/utils/github";

type RepoFormProps = {
	token: string;
	onRepoCreated: (repoName: string) => void;
};

export default function RepositoryForm({
	token,
	onRepoCreated,
}: RepoFormProps) {
	const [isPrivate, setIsPrivate] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setIsLoading(true);
		try {
			const repoName = await createGitHubRepo(isPrivate, token, "kepsteen");
			onRepoCreated(repoName);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>Create New Repository</CardTitle>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="visibility">Repository Visibility</Label>
						<Select
							value={isPrivate?.toString()}
							onValueChange={(value) => setIsPrivate(value === "true")}
							required
						>
							<SelectTrigger id="visibility">
								<SelectValue placeholder="Select visibility" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="true">Private Repository</SelectItem>
								<SelectItem value="false">Public Repository</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
				<CardFooter>
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Creating..." : "Create Repository"}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
