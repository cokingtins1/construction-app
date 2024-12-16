"use client";

import { useEffect, useMemo, useState } from "react";
import type {
	ColDef,
	RowSelectionOptions,
	ValueGetterParams,
	ValueSetterParams,
} from "ag-grid-community";
import {
	AllCommunityModule,
	colorSchemeDarkBlue,
	ModuleRegistry,
	themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { getTheme } from "@/lib/context/theme";
import { useTheme } from "@/lib/context/theme-context";
import { formatDollars } from "@/lib/utils";
import { RateLevel, TeamMember, WBSTemplate } from "@prisma/client";

ModuleRegistry.registerModules([AllCommunityModule]);

type DynamicWBSProps = {
	teamData: TeamMember[];
	rateLevels: RateLevel[];
};
export default function DynamicWBS({ teamData, rateLevels }: DynamicWBSProps) {
	const [teamMembers, setTeamMembers] = useState<TeamMember[]>(teamData);

	const roles = rateLevels.map((r) =>r.code );
	console.log(roles);

	const staticColumnDefs: ColDef[] = [
		{
			field: "task",
			headerName: "Department Task",
			width: 250,
		},

		{
			field: "assumptions",
			headerName: "Assumptions",
			width: 150,
		},
	];

    // const dynamicColDefs: ColDef[] = rateLevels.map((rate) => ({
    //     field: 
    // }))

	return <div>DynamicWBS</div>;
}
