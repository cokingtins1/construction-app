"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
	CellPosition,
	ColDef,
	NavigateToNextCellParams,
	SuppressKeyboardEventParams,
	ValueGetterParams,
	ValueParserParams,
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
import {
	convertCurrencyToNum,
	formatDollars,
	getRateByEmpId,
	rateLevelOrder,
} from "@/lib/utils";
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

	const gridRef = useRef<AgGridReact>(null);

	const sizeToFit = useCallback(() => {
		if (gridRef.current) {
			gridRef.current.api.sizeColumnsToFit();
		}
	}, [gridRef]);

	const [rowData, setRowData] = useState(() => prepareGridData());

	const calcTotalHours = (params: ValueGetterParams) => {
		if (params.data.notes === "Total Dollars") return 0;
		return teamMembers.reduce(
			(sum, member) => sum + (Number(params.data[member.id]) || 0),
			0
		);
	};

	const calcTotalDollars = (params: ValueGetterParams) => {
		if (params.data.notes === "Total Dollars") {
			return Object.entries(params.data as Record<string, string>).reduce(
				(sum, [key, value]) => {
					return sum + convertCurrencyToNum(value);
				},
				0
			);
		} else if (params.data.notes === "Total Hours") {
			return 0;
		} else {
			return teamMembers.reduce((sum, member) => {
				const hours = params.data[member.id] || 0;

				const rateInfo = rateLevel.find(
					(r) => r.code === member.rate_level_code
				);
				const rate = rateInfo ? rateInfo.rate : 0;
				return sum + hours * rate;
			}, 0);
		}
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
		const baseColumns: ColDef[] = [
			{
				headerName: "Task",
				field: "task",
				editable: false,
				suppressSizeToFit: false,
			},
			{
				headerName: "Notes",
				field: "notes",
				editable: false,
				suppressSizeToFit: false,
			},
		];

		// Dynamic team member columns
		const teamMemberColumns: ColDef[] = teamMembers.map((member) => ({
			headerName: member.rate_level_code,
			field: member.id,
			editable: true,
			suppressSizeToFit: false,
			valueParser: (params: ValueParserParams) => {
				const newValue = params.newValue;
				return typeof newValue === "string"
					? newValue
					: Number(newValue);
			},
			onCellValueChanged: onHoursChanged,
		}));

		const totalsColumns: ColDef[] = [
			{
				headerName: "Total Hours",
				field: "total_hours",
				editable: false,
				suppressSizeToFit: false,
				valueGetter: calcTotalHours,
				valueFormatter: (params) => {
					return params.value > 0 ? `${params.value.toFixed(2)}` : "";
				},
			},
			{
				headerName: "Total Dollars",
				field: "total_dollars",
				editable: false,
				suppressSizeToFit: false,
				valueGetter: calcTotalDollars,
				valueFormatter: (params) => {
					return params.value > 0 ? formatDollars(params.value) : "";
				},
			},
		];

		return [...baseColumns, ...teamMemberColumns, ...totalsColumns];
	}, [teamMembers]);

	const editableFields: string[] = columnDefs
		.filter(
			(col): col is { field: string } =>
				col.editable === true && typeof col.field === "string"
		)
		.map((col) => col.field);

	const totals = editableFields.reduce((acc, field) => {
		acc[field] = rowData.reduce((sum, row) => {
			const value = Number(row[field] || 0);
			return sum + value;
		}, 0);

		return acc;
	}, {} as Record<string, number>);

	const pinnedTotals: Record<string, number | string>[] = useMemo(() => {
		const totalsArray = Object.entries(totals).map(([key, value]) => ({
			key,
			value: Number(value), // Ensure value is a number
		}));

		const result = totalsArray.reduce((obj, item) => {
			const rate = getRateByEmpId(item.key, teamMembers, rateLevel);
			if (rate !== null) {
				const product = item.value * rate;
				obj[item.key] = product;
			}
			return obj;
		}, {} as Record<string, number>);

		return [
			{
				notes: "Total Hours",
				...totalsArray.reduce((acc, { key, value }) => {
					acc[key] = value; // Preserve numeric values
					return acc;
				}, {} as Record<string, number>),
			},
			{
				notes: "Total Dollars",
				...Object.entries(result).reduce((acc, [key, value]) => {
					acc[key] = formatDollars(value);
					return acc;
				}, {} as Record<string, string>),
			},
		];
	}, [totals, teamMembers, rateLevel]);

	const navigateToNextCell = useCallback(
		(params: NavigateToNextCellParams): CellPosition | null => {
			const previousCell = params.previousCellPosition;
			const suggestedNextCell = params.nextCellPosition;

			switch (params.key) {
				case "Enter":
					const nextRow = params.previousCellPosition.rowIndex + 1;
					const nextCol = params.previousCellPosition.column;
					return {
						rowIndex: nextRow,
						column: nextCol,
						rowPinned: previousCell.rowPinned,
					};
			}

			return suggestedNextCell;
		},
		[]
	);

	function suppressEnter(params: SuppressKeyboardEventParams) {
		const KEY_ENTER = "Enter";
		const event = params.event;
		const key = event.key;
		const suppress = key === KEY_ENTER;
		return suppress;
	}

	return (
		<div style={containerStyle}>
			<div style={gridStyle}>
				<AgGridReact
					gridId="grid"
					ref={gridRef}
					theme={getTheme(theme)}
					rowData={rowData}
					columnDefs={columnDefs}
					defaultColDef={defaultColDef}
					// autoSizeStrategy={{ type: "fitCellContents" }}
					// navigateToNextCell={navigateToNextCell}
					pinnedBottomRowData={pinnedTotals}
					onGridReady={sizeToFit}
				/>
			</div>
		</div>
	);
}
