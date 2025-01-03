import { RateLevel, TeamMember, WBSAssignment } from "@prisma/client";
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



export function convertCurrencyToNum(currency: string) {
	return Number(currency.replace(/[^0-9.-]+/g, ""));
}

export function baseId(id: string | undefined) {
	return id?.split("_")[0];
}

type UUID = string & { __uuid: void };

export function isUUID(uuid: string | undefined): uuid is UUID {
	if (!uuid) return false;
	// const UUID_REGEX =
	// 	/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
	const UUID_REGEX =
		/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}(?:_(?:[0-9]|[1-9][0-9]|100))?$/;

	return UUID_REGEX.test(uuid);
}

export function handleDuplicateIds(objects: WBSAssignment[]): { id: string }[] {
	const idCounts: Record<string, number> = {};

	return objects.map((obj) => {
		const baseId = obj.team_member_id;

		// Increment the count for the current id
		if (!idCounts[baseId]) {
			idCounts[baseId] = 0;
		}
		idCounts[baseId] += 1;

		// If there are duplicates, append the count - 1
		if (idCounts[baseId] > 1) {
			return {
				...obj,
				team_member_id: `${baseId}_${idCounts[baseId] - 1}`,
			};
		}

		return obj; // Return original object if it's the first occurrence
	});
}

export function getRateByEmpId(
	empId: string,
	teamMembers: TeamMember[],
	rateLevel: RateLevel[]
): number {
	const teamMember = teamMembers.find((mem) => mem.id === baseId(empId));

	if (!teamMember) return 0;

	const rateInfo = rateLevel.find(
		(rate) => rate.code === teamMember.rate_level_code
	);

	return rateInfo ? rateInfo.rate : 0;
}
