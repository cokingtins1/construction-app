import Logout from "@/components/custom/Logout";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import Link from "next/link";

export default function Home() {
	const { PROCORE_CLIENT_ID, PROCORE_REDIRECT_URI, PROCORE_AUTH_ENDPOINT } =
		process.env;

	const href = `${PROCORE_AUTH_ENDPOINT}?client_id=${PROCORE_CLIENT_ID}&response_type=code&redirect_uri=${PROCORE_REDIRECT_URI}`;

	return (
		<div className="flex flex-col gap-4">
			<Link href={href} className="bg-white text-black p-2 rounded-md">
				Login with Procore
			</Link>

			<form
				action={async () => {
					"use server";
					await logout();
				}}
			>
				<Button>Logout</Button>
			</form>
		</div>
	);
}
