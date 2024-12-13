"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { useTheme } from "./theme-context";

export default function ThemeSwitch() {
	const { toggleTheme } = useTheme();

	return (
		<Button className="fixed bottom-5 left-12 dark" onClick={toggleTheme}>
			Toggle Theme
		</Button>
	);
}
