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
			cellDataType: "number",
			width: 48,
			valueGetter: (params: ValueGetterParams) =>
				params.data.WBSAssignment?.find(
					(a: WBSAssignment) => a.team_member_id === id
				)?.hours || 0,

			valueSetter: (params: ValueSetterParams<WBSActivityWithAssignments>) => {
				const { newValue, data } = params;
				const assignment = data.WBSAssignment.find(
					(a: WBSAssignment) => a.team_member_id === id
				);

                const wbsActivityId = assignment?.wbs_activity_id

				if (assignment) {
					assignment.hours = Number(newValue) || 0;
				} else {
					// If no assignment exists, create a new one
                    
					data.WBSAssignment.push({
						id: id,
                        wbs_activity_id: wbsActivityId,
						hours: Number(newValue) || 0,
						rate: 0, // Set a default rate if needed
					});
				}

				// Update totals
				data.total_hours = (params: any) => calculateTotalHours(params);
				data.total_dollars = (params: any) =>
					calculateTotalDollars(params);

				return true;
			},
			valueFormatter: (params: { value: number }) =>
				params.value > 0 ? params.value.toFixed(2) : "",
		})
	);

	// Horizontal Totals
	const totalsColDefs: ColDef[] = [
		{
			field: "totalHours",
			headerName: "Total Hours",
			editable: false,
			valueGetter: (params) => calculateTotalHours(params),

			cellStyle: { fontWeight: "bold" },
			valueFormatter: (params) => {
				return params.value > 0 ? `${params.value.toFixed(2)}` : "";
			},
		},
		{
			field: "totalDollars",
			headerName: "Total Dollars",
			editable: false,
			valueGetter: (params) => calculateTotalDollars(params),

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
		const hours = params.node?.data?.WBSAssignment ?? [];
		const totalHours = hours?.reduce(
			(sum, row) => sum + (row.hours || 0),
			0
		);

		return totalHours || 0;
	}

	function calculateTotalDollars(
		params: ValueGetterParams<WBSActivityWithAssignments>
	) {
		const hours = params.node?.data?.WBSAssignment;
		console.log("hours:", hours);
		const totalHours = hours?.reduce(
			(sum, row) => sum + (row.hours || 0) * (row.rate || 0),
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

	useEffect(() => {
		updateTotalsRow(rowData, colDefs);
	}, [rowData]);

	const handleCellValueChanged = (params: any) => {
		const updatedRowData = [...rowData];
		const rowIndex = updatedRowData.findIndex(
			(row) => row.task === params.data.task
		);

		const balls = calculateTotalDollars(params);
		const balls2 = calculateTotalHours(params);
		console.log(balls, balls2);

		if (rowIndex !== -1) {
			updatedRowData[rowIndex] = {
				...params.data,
				total_hours: calculateTotalHours(params),
				total_dollars: calculateTotalDollars(params),
			};
		}

		setRowData(updatedRowData);
		updateTotalsRow(updatedRowData, colDefs);
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
