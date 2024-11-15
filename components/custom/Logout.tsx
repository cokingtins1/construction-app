"use client";

import React from "react";
import { Button } from "../ui/button";

export default function Logout() {
	const handleLogout = async () => {
		await fetch("/api/auth/logout", {
			method: "POST",
		});
	};

	return <Button onClick={ () => {
        ""
    }}>Logout</Button>;

}
