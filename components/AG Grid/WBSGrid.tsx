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
import { data, WBSActivity } from "./data";
import { formatDollars } from "@/lib/utils";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function WBSGrid() {
	const { theme } = useTheme();

	const [rowData, setRowData] = useState<WBSActivity[]>(data);
	const [colDefs, setColDefs] = useState<ColDef[]>([
		{ field: "task" },
		{ field: "assumption" },
		{
			field: "hours_MGR",
			cellDataType: "number",
			headerName: "MGR ($215)",
			valueSetter: (params: ValueSetterParams<WBSActivity>) => {
				params.data.hours_MGR = Number(params.newValue);
				params.data.totalHours =
					(params.data.hours_MGR ?? 0) +
					(params.data.hours_SPTL ?? 0);
				return true;
			},
			valueFormatter: (params) => {
				return params.value || "";
			},
		},
		{
			field: "hours_SPTL",
			cellDataType: "number",
			headerName: "SPTL ($200)",
			valueSetter: (params: ValueSetterParams<WBSActivity>) => {
				params.data.hours_SPTL = Number(params.newValue);
				params.data.totalHours =
					(params.data.hours_MGR ?? 0) +
					(params.data.hours_SPTL ?? 0);
				return true;
			},
			valueFormatter: (params) => {
				return params.value || "";
			},
		},
		{
			field: "totalHours",
			cellDataType: "number",
			headerName: "Total Hours",
			editable: false,
			valueGetter: (params: ValueGetterParams<WBSActivity>) => {
				const hoursMGR = params.data?.hours_MGR || 0;
				const hoursSPTL = params.data?.hours_SPTL || 0;
				return hoursMGR + hoursSPTL;
			},
			valueFormatter: (params) => {
				return params.value > 0 ? `${params.value.toFixed(2)}` : "";
			},
		},
		{
			field: "totalDollars",
			cellDataType: "number",
			headerName: "Total Dollars",
			editable: false,
			valueGetter: (params: ValueGetterParams<WBSActivity>) => {
				const hoursMGR = params.data?.hours_MGR || 0;
				const rateMGR = 215;
				const hoursSPTL = params.data?.hours_SPTL || 0;
				const rateSPTL = 200;
				return hoursMGR * rateMGR + hoursSPTL * rateSPTL;
			},
			valueFormatter: (params) => {
				return params.value > 0
					? `$${formatDollars(params.value)}`
					: "";
			},
		},
	]);

	const defaultColDef: ColDef = {
		filter: false,
		suppressMovable: true,
		editable: true,
		cellStyle: {
			borderRight: "1px solid #404854",
		},
	};

	const [totalHoursMGR, setTotalHoursMGR] = useState(() =>
		rowData.reduce((sum, row) => sum + row.hours_MGR, 0)
	);
	const [totalHoursSPTL, setTotalHoursSPTL] = useState(() =>
		rowData.reduce((sum, row) => sum + row.hours_SPTL, 0)
	);

	type TotalsRow = {
		task: string;
		hours_MGR: number;
		hours_SPTL: number;
		totalHours: number;
		totalDollars: number;
	};
	const [totalsRow, setTotalsRow] = useState<TotalsRow[]>([]);

	const updateTotalsRow = (rowData: WBSActivity[]) => {
		const MGR = rowData.reduce((sum, row) => sum + (row.hours_MGR || 0), 0);
		const SPTL = rowData.reduce(
			(sum, row) => sum + (row.hours_SPTL || 0),
			0
		);

		setTotalsRow([
			{
				task: "Total",
				hours_MGR: MGR,
				hours_SPTL: SPTL,
				totalHours: MGR + SPTL,
				totalDollars: MGR * 215 + SPTL * 200,
			},
		]);
	};

	// Initialize totals row on mount
	useEffect(() => {
		updateTotalsRow(rowData);
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

	console.log("RENDER!");

	return (
		<div className="relative w-[1280px] h-[700px]">
			<AgGridReact
				theme={getTheme(theme)}
				rowData={rowData}
				columnDefs={colDefs}
				defaultColDef={defaultColDef}
				onCellValueChanged={handleCellValueChanged}
				autoSizeStrategy={{ type: "fitCellContents" }}
				pinnedBottomRowData={totalsRow}
			/>
		</div>
	);
}
