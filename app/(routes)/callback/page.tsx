"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const code = searchParams.get("code");

	useEffect(() => {
		const handleCallback = async () => {
			if (code) {
				const response = await fetch("/api/auth/callback", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ code }),
				});

				const data = await response.json();
				console.log(data);

				if (data.error) {
					console.error("Error exchanging token:", data.error);
					return;
				}

				console.log("Token Data:", data.tokenData);
				// Redirect or store token as needed
				router.push("/");
			} else {
				console.error(
					"Authorization code not found in query parameters"
				);
				router.push("/fail");
			}
		};

		handleCallback();
	}, [router]);

	return <div>this is the callback</div>;
}
