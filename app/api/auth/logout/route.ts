import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const response = NextResponse.json({
			message: "Logged out successfully",
		});

		const cookiesStore = await cookies();

		cookiesStore.delete("access_token");
		cookiesStore.delete("refresh_token");

		return NextResponse.json({
			message: "success",
		});
	} catch (error) {
		return NextResponse.json({
			message: "error",
		});
	}
}
