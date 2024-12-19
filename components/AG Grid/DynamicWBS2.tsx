"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { formatDollars, rateLevelOrder } from "@/lib/utils";
import {
	RateLevel,
	TeamMember,
	WBSActivity,
	WBSAssignment,
	WBSTemplate,
} from "@prisma/client";
import { ActivitiesWithAssignments } from "@/lib/types";
import { number } from "zod";
import {
	rateLevel,
	teamMembers,
	WBSActivities,
	WBSAssignments,
} from "@/app/(routes)/ag-grid/data";

ModuleRegistry.registerModules([AllCommunityModule]);

type DynamicWBSProps = {
	data: ActivitiesWithAssignments;
};
export default function DynamicWBS2() {
	const { theme } = useTheme();

	// const gridStyle = useMemo(() => ({ height: "300px", width: "1450px" }), []);
	// const containerStyle = useMemo(
	// 	() => ({ width: "100%", height: "100%" }),
	// 	[]
	// );

	const containerStyle = useMemo(
		() => ({ width: "100%", height: "100%" }),
		[]
	);
	const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);

	const defaultColDef: ColDef = {
		filter: false,
		suppressMovable: true,
		editable: true,
	};

	const cellSelection = useMemo(() => {
		return {
			handle: {
				mode: "fill",
			},
		};
	}, []);

	const [rowData, setRowData] = useState(() => prepareGridData());

	const calcTotalHours = (params: any) => {
		return teamMembers.reduce(
			(sum, member) => sum + (params.data[member.id] || 0),
			0
		);
	};

	const calcTotalDollars = (params: any) => {
		return teamMembers.reduce((sum, member) => {
			const hours = params.data[member.id] || 0;

			const rateInfo = rateLevel.find(
				(r) => r.code === member.rate_level_code
			);
			const rate = rateInfo ? rateInfo.rate : 0;
			return sum + hours * rate;
		}, 0);
	};

	const onHoursChanged = useCallback((params: any) => {
		const updatedData = params.data;
		const member = teamMembers.find((tm) => tm.id === params.colDef.field);

		if (member) {
			updatedData.total_hours = calcTotalHours(params);
			updatedData.total_dollars = calcTotalDollars(params);
		}
		setRowData((prevData) => [...prevData]);
	}, []);

	function prepareGridData() {
		return WBSActivities.map((activity) => {
			const assignments = WBSAssignments.filter(
				(a) => a.wbs_activity_id === activity.id
			);
			const row: any = {
				task: activity.task,
				notes: activity.notes,
			};

			// Add hours and rates for team members dynamically
			teamMembers.forEach((member) => {
				const assignment = assignments.find(
					(a) => a.team_member_id === member.id
				);
				row[member.id] = assignment ? assignment.hours : 0;
			});

			// Calculate initial totals
			row.total_hours = assignments.reduce((sum, a) => sum + a.hours, 0);
			row.total_dollars = assignments.reduce(
				(sum, a) => sum + a.hours * a.rate,
				0
			);
			return row;
		});
	}

	const columnDefs = useMemo(() => {
		const baseColumns = [
			{ headerName: "Task", field: "task", editable: false },
			{ headerName: "Notes", field: "notes", editable: false },
		];

		// Dynamic team member columns
		const teamMemberColumns: ColDef[] = teamMembers.map((member) => ({
			headerName: member.rate_level_code,
			field: member.id,
			editable: true,
			onCellValueChanged: onHoursChanged,
		}));

		const totalsColumns: ColDef[] = [
			{
				headerName: "Total Hours",
				field: "total_hours",
				editable: false,
				valueGetter: calcTotalHours,
				valueFormatter: (params) => {
					return params.value > 0 ? `${params.value.toFixed(2)}` : "";
				},
			},
			{
				headerName: "Total Dollars",
				field: "total_dollars",
				editable: false,
				valueGetter: calcTotalDollars,
				valueFormatter: (params) => {
					return params.value > 0
						? `$${formatDollars(params.value)}`
						: "";
				},
			},
		];

		return [...baseColumns, ...teamMemberColumns, ...totalsColumns];
	}, []);

	const editableFields: string[] = columnDefs
		.filter(
			(col): col is { field: string } =>
				col.editable === true && typeof col.field === "string"
		)
		.map((col) => col.field);

	const totals = editableFields.reduce((acc, field) => {
		acc[field] = rowData.reduce((sum, row) => sum + (row[field] || 0), 0);

		return acc;
	}, {} as Record<string, number>);

	const pinnedTotals = useMemo<any[]>(() => {
		const totalsArray = Object.entries(totals).map(([key, value]) => ({
			key,
			value,
		}));
		return [
			{
				notes: "Totals:",
				...totalsArray.reduce((acc, { key, value }) => {
					acc[key] = value;
					return acc;
				}, {} as Record<string, any>),
			},
		];
	}, [rowData]);

	return (
		<div style={containerStyle}>
			<div style={gridStyle}>
				<AgGridReact
					theme={getTheme(theme)}
					rowData={rowData}
					columnDefs={columnDefs}
					defaultColDef={defaultColDef}
					autoSizeStrategy={{ type: "fitCellContents" }}
					pinnedBottomRowData={pinnedTotals}
				/>
			</div>
		</div>
	);
}
