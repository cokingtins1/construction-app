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

ModuleRegistry.registerModules([AllCommunityModule]);

type DynamicWBSProps = {
	data: ActivitiesWithAssignments;
};
export default function DynamicWBS({ data }: DynamicWBSProps) {
	const { theme } = useTheme();

	const tasks = data.map((row) => row);

	const teamMembers: TeamMember[] = Array.from(
		new Map(
			data
				.flatMap((activity) => activity.WBSAssignment)
				.map((assignment) => [
					assignment.team_member_id,
					assignment.TeamMember,
				])
		).values()
	).sort((a, b) => {
		const aOrder = rateLevelOrder[a.rate_level_code] ?? 4;
		const bOrder = rateLevelOrder[b.rate_level_code] ?? 4;
		return aOrder - bOrder;
	});

	const [rowData, setRowData] = useState<WBSActivityWithAssignments[]>(tasks);

	const defaultColDef: ColDef = {
		filter: false,
		suppressMovable: true,
		editable: true,
		// cellStyle: {
		// 	borderRight: "1px solid var(--row-border)",
		// },
	};

	const dynamicColDefs: ColDef[] = teamMembers.map(
		({ rate_level_code, id }) => ({
			field: `hours_${id}`,
			colId: "teamMember",
			headerName: `${rate_level_code}`,
			editable: true,
			cellDataType: "number",
			valueGetter: (params: ValueGetterParams) =>
				params.data.WBSAssignment?.find(
					(a: WBSAssignment) => a.team_member_id === id
				)?.hours || 0,
			valueSetter: (params: ValueSetterParams) => {
				const assignment = params.data.WBSAssignment.find(
					(a: WBSAssignment) => a.team_member_id === id
				);
				if (assignment) {
					assignment.hours = Number(params.newValue);
					params.data.total_hours = calculateTotalHours(params.data);
					params.data.total_dollars = calculateTotalDollars(
						params.data
					);
				}
				return true;
			},
			valueFormatter: (params: { value: number }) =>
				params.value > 0 ? params.value.toFixed(2) : "",
		})
	);

	// const calculateTotalHours = (
	// 	rowData: WBSActivityWithAssignments
	// ): number => {
	// 	return (
	// 		rowData.WBSAssignment?.reduce(
	// 			(sum: number, assignment: WBSAssignment) =>
	// 				sum + (assignment.hours || 0),
	// 			0
	// 		) || 0
	// 	);
	// };

	// Calculate total dollars for a row
	// const calculateTotalDollars = (
	// 	// rowData: WBSActivityWithAssignments
	// 	rowHours: number | undefined,
	// 	rowRate: number | undefined
	// ): number => {
	// 	if (rowHours && rowRate) {
	// 		return rowHours * rowRate;
	// 	}
	// 	return 0; // Return 0 if either is undefined
	// 	// return (
	// 	// 	rowData.WBSAssignment?.reduce(
	// 	// 		(sum: number, assignment: WBSAssignment) =>
	// 	// 			sum + (assignment.total_dollars || 0),
	// 	// 		0
	// 	// 	) || 0
	// 	// );
	// };

	// Horizontal Totals
	const totalsColDefs: ColDef[] = [
		{
			field: "totalHours",
			headerName: "Total Hours",
			editable: false,
			valueGetter: calculateTotalHours,

			cellStyle: { fontWeight: "bold" },
			valueFormatter: (params) => {
				return params.value > 0 ? `${params.value.toFixed(2)}` : "";
			},
		},
		{
			field: "totalDollars",
			headerName: "Total Dollars",
			editable: false,
			valueGetter: calculateTotalDollars,

			cellStyle: { fontWeight: "bold" },
			valueFormatter: (params) => {
				return params.value > 0
					? `$${formatDollars(params.value)}`
					: "";
			},
		},
	];

	function calculateTotalHours(
		params: ValueGetterParams<WBSActivityWithAssignments>
	) {
		const hours = params.node?.data?.WBSAssignment;
		const totalHours = hours?.reduce((sum, row) => sum + row.hours, 0);

		return totalHours || 0;
	}

	function calculateTotalDollars(
		params: ValueGetterParams<WBSActivityWithAssignments>
	) {
		const hours = params.node?.data?.WBSAssignment;
		const totalHours = hours?.reduce(
			(sum, row) => sum + row.hours * row.rate,
			0
		);

		return totalHours || 0;
	}

	const staticColumnDefs: ColDef[] = [
		{
			field: "task",
			colId: "hi",
			headerName: "Department Task",
			width: 250,
			editable: false,
		},

		{
			field: "notes",
			headerName: "Assumptions",
			width: 150,
			editable: false,
		},
	];

	const [colDefs, setColDefs] = useState<ColDef[]>([
		...staticColumnDefs,
		...dynamicColDefs,
		...totalsColDefs,
	]);

	type TotalsRow = Record<string, any>;
	const [totalsRow, setTotalsRow] = useState<TotalsRow[]>([]);

	type WBSActivityWithAssignments = WBSActivity & {
		WBSAssignment: WBSAssignment[];
	} & { [key: `hours_${string}`]: number | undefined };

	const updateTotalsRow = (
		rowData: WBSActivityWithAssignments[],
		colData: ColDef[]
	) => {
		const totalsRow: Record<string, any> = {
			task: "Total",
			notes: "Summary",
			totalHours: 0,
			totalDollars: 0,
		};

		colData.forEach((col) => {
			if (col.field) {
				// Ensure all fields from colDefs are initialized
				if (!totalsRow[col.field]) {
					totalsRow[col.field] = 0;
				}
			}
		});

		colData.forEach((col) => {
			if (col.field?.startsWith("hours_")) {
				const teamMemberId = col.field.split("_")[1];
				const columnTotal = rowData.reduce((sum, row) => {
					const assignment = row.WBSAssignment.find(
						(assignment) =>
							assignment.team_member_id === teamMemberId
					);
					return sum + (assignment?.hours || 0);
				}, 0);

				totalsRow[col.field] = columnTotal;
				totalsRow.totalHours += columnTotal;

				const rate =
					rowData[0]?.WBSAssignment.find(
						(assignment) =>
							assignment.team_member_id === teamMemberId
					)?.rate || 0;
				totalsRow.totalDollars += columnTotal * rate;
			}
		});

		setTotalsRow([totalsRow]);
	};

	// console.log(colDefs.map((col) => col.field));

	useEffect(() => {
		updateTotalsRow(rowData, colDefs);
	}, [rowData]);

	const handleCellValueChanged = (params: any) => {
		const updatedRowData = [...rowData];
		const updatedRowIndex = updatedRowData.findIndex(
			(row) => row.task === params.data.task
		);
		if (updatedRowIndex !== -1) {
			updatedRowData[updatedRowIndex] = params.data;
			setRowData(updatedRowData);
		}
	};

	return (
		<div className="relative w-[1280px] h-[250px]">
			<AgGridReact
				theme={getTheme(theme)}
				rowData={rowData}
				columnDefs={colDefs}
				defaultColDef={defaultColDef}
				onCellValueChanged={handleCellValueChanged}
				autoSizeStrategy={{ type: "fitCellContents" }}
				// pinnedBottomRowData={totalsRow}
			/>
		</div>
	);
}
