import { RateLevel, TeamMember } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDollars(number: any) {
	if (typeof number === "number") {
		return (
			"$" +
			number
				.toFixed(2)
				.toString()
				.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		);
	} else {
		return "NaN";
	}
}

export const rateLevelOrder: Record<string, number> = {
	MGR: 0,
	SPTL: 1,
	PTL: 2,
	COOP: 3,
};

export function getRateByEmpId(
	empId: string,
	teamMembers: TeamMember[],
	rateLevel: RateLevel[]
): number | null {
	const teamMember = teamMembers.find((mem) => mem.id === empId);

	if (!teamMember) return null;

	const rateInfo = rateLevel.find(
		(rate) => rate.code === teamMember.rate_level_code
	);

	return rateInfo ? rateInfo.rate : null;
}

export function convertCurrencyToNum(currency: string) {
	return Number(currency.replace(/[^0-9.-]+/g, ""));
}
