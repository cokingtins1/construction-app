import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDollars(number: any) {
	if (typeof number === "number") {
		return number.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	} else {
		return "NaN";
	}
}
