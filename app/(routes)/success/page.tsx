import { cookies } from "next/headers";

export default async function Page() {
	const cookieStore = await cookies().get(
		"sb-njowjcfiaxbnflrcwcep-auth-token"
	)?.value;

	return <div>Auth Success!</div>;
}
