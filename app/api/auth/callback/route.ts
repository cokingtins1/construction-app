import { checkPrimeSync } from 'crypto';
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	const {
		PROCORE_CLIENT_ID,
		PROCORE_REDIRECT_URI,
		PROCORE_TOKEN_ENDPOINT,
		PROCORE_CLIENT_SECRET,
	} = process.env;

	debugger
	try {
		const body = await req.json();
		const { code, refresh_token } = body;

		console.log("refresh:", refresh_token);

		const stop = false;

		// Handle the token exchange flow if code is provided
		if (code && !stop) {
			console.log("Here POST!")
			const response = await fetch(PROCORE_TOKEN_ENDPOINT as string, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					client_id: PROCORE_CLIENT_ID as string,
					client_secret: PROCORE_CLIENT_SECRET as string,
					grant_type: "authorization_code",
					code: code as string,
					redirect_uri: PROCORE_REDIRECT_URI as string,
				}),
			});

			// console.log("response.ok:", response.ok)

			if (!response.ok) {
				const errorText = await response.text();
				console.log("Token Exchange Error:", errorText);
				return NextResponse.json(
					{ error: "Failed to exchange authorization code" },
					{ status: 500 }
				);
			}

			const tokenData = await response.json();
			console.log("Token Data:", tokenData);

			// Store tokens in cookies
			const {
				access_token,
				refresh_token: newRefreshToken,
				expires_in,
			} = tokenData;

			const responseData = NextResponse.json({
				message: "Authorization successful",
				tokenData,
			});

			// Set the access token and refresh token in cookies
			responseData.cookies.set("access_token", access_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: expires_in * 1000, // Access token expiration time
				path: "/",
			});

			responseData.cookies.set("refresh_token", newRefreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 30 * 24 * 60 * 60 * 1000, // Refresh token expiration time (30 days)
				path: "/",
			});

			return responseData;
		}

		// Handle the token refresh flow if refresh_token is provided
		if (refresh_token) {
			console.log("REFRESH HERE!");
			const response = await fetch(PROCORE_TOKEN_ENDPOINT as string, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					client_id: PROCORE_CLIENT_ID as string,
					client_secret: PROCORE_CLIENT_SECRET as string,
					grant_type: "refresh_token",
					refresh_token: refresh_token as string,
				}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.log("Token Refresh Error:", errorText);
				return NextResponse.json(
					{ error: "Failed to refresh token" },
					{ status: 500 }
				);
			}

			const tokenData = await response.json();
			console.log("New Token Data:", tokenData);

			// Store the new tokens in cookies
			const {
				access_token,
				refresh_token: newRefreshToken,
				expires_in,
			} = tokenData;

			const responseData = NextResponse.json({
				message: "Token refreshed successfully",
				tokenData,
			});

			// Update the cookies with the new tokens
			responseData.cookies.set("access_token", access_token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: expires_in * 1000, // New access token expiration time
				path: "/",
			});

			responseData.cookies.set("refresh_token", newRefreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				maxAge: 30 * 24 * 60 * 60 * 1000, // Refresh token expiration time (30 days)
				path: "/",
			});

			return responseData;
		}

		return NextResponse.json(
			{ error: "Missing code or refresh_token" },
			{ status: 400 }
		);
	} catch (error) {
		console.error("Callback Error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
