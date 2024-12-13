import { NextResponse } from "next/server";

export async function GET(req: Request) {
	console.log("hello api");

	return NextResponse.json({
		message: "you are authenticated",
	});
}
