"use client";

import { Button } from "@/components/ui/button";
import { Form } from "../ui/form";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function AuthForm() {
	const [answer, setAnswer] = useState("");
	const [data, setData] = useState(null);

	const form = useForm({});
	const onSubmit = async () => {
		const res = await fetch("/api/auth", {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		});
	};

	return (
		<div>
			<Form {...form}>
				<form
					className="flex items-center gap-4 w-full"
					autoComplete="off"
					onSubmit={form.handleSubmit(onSubmit)}
				>
					<Button type="submit">Authenticate</Button>
				</form>
			</Form>
		</div>
	);
}
