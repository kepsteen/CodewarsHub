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
};

export default function RepositoryForm({ token }: RepoFormProps) {
	const [isPrivate, setIsPrivate] = useState<boolean>(false);

	const handleSubmit = (event: React.FormEvent) => {
		event.preventDefault();
		createGitHubRepo(isPrivate, token, "kepsteen");
		setIsPrivate(false);
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
					<Button type="submit" className="w-full">
						Create Repository
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
