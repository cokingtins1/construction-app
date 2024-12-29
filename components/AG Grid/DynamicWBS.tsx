"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
	CellClassParams,
	CellPosition,
	CellStyle,
	CellStyleFunc,
	CellValueChangedEvent,
	ColDef,
	ColSpanParams,
	GridOptions,
	NavigateToNextCellParams,
	RowSpanParams,
	SuppressKeyboardEventParams,
	TabToNextCellParams,
	ValueFormatterLiteParams,
	ValueFormatterParams,
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

import { Button } from "../ui/button";
import { DB_DATA } from "@/app/(routes)/ag-grid/data";
import { useTheme } from "@/lib/context/theme-context";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function DynamicWBS() {
	const { theme } = useTheme();

	const { rateLevel, WBSAssignments, WBSActivities, addTeamMember } =
		useMemo(() => {
			return DB_DATA;
		}, [DB_DATA]);

	const [teamMembers, setTeamMembers] = useState(() => DB_DATA.teamMembers);

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

	const [rowData, setRowData] = useState(() => prepareGridData());

	const calcTotalHours = (params: ValueGetterParams) => {
		if (params.data.task === "Total Dollars") return null;
		return teamMembers.reduce(
			(sum, member) => sum + (Number(params.data[member.id]) || 0),
			0
		);
	};

	const calcTotalDollars = (params: ValueGetterParams) => {
		if (params.data.task === "Total Dollars") {
			return Object.entries(params.data as Record<string, string>).reduce(
				(sum, [key, value]) => {
					return sum + convertCurrencyToNum(value);
				},
				0
			);
		} else if (params.data.task === "Total Hours") {
			return null;
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

	function prepareGridData() {
		return WBSActivities.map((activity) => {
			const assignments = WBSAssignments.filter(
				(a) => a.wbs_activity_id === activity.id
			);
			const row: any = {
				task: activity.task,
				notes: activity.notes,
			};

			teamMembers.forEach((member) => {
				const assignment = assignments.find(
					(a) => a.team_member_id === member.id
				);
				row[member.id] = assignment ? assignment.hours : 0;
			});

			row.total_hours = assignments.reduce((sum, a) => sum + a.hours, 0);
			row.total_dollars = assignments.reduce(
				(sum, a) => sum + a.hours * a.rate,
				0
			);
			return row;
		});
	}

	const [teamColumn, setTeamColumn] = useState<ColDef[]>(() => {
		return teamMembers.map((member) => ({
			headerName: member.rate_level_code,
			field: member.id,
			editable: true,
			cellStyle: { textAlign: "center" },
			valueParser: (params: ValueParserParams) => {
				const newValue = params.newValue;
				return typeof newValue === "string"
					? newValue
					: Number(newValue);
			},
			onCellValueChanged: (params) => {
				const updatedRowData = [...rowData];
				setRowData(updatedRowData);
			},
		}));
	});

	const [baseColumn, setBaseColumn] = useState<ColDef[]>(() => {
		return [
			{
				headerName: "Task",
				field: "task",
				type: "text",
				editable: true,
				colSpan: (params: ColSpanParams) => {
					if (params.node?.rowPinned) {
						return 2;
					}
					return 1;
				},
				cellStyle: (params) => {
					if (params.node.rowPinned) {
						return {
							textAlign: "right",
						};
					}
					return null;
				},
			},
			{
				headerName: "Notes",
				field: "notes",
				type: "text",
				editable: true,
			},
		];
	});

	const [totalsColumn, setTotalsColumn] = useState<ColDef[]>(() => {
		return [
			{
				headerName: "Total Hours",
				field: "total_hours",
				editable: false,
				cellStyle: { textAlign: "center" },
				enableCellChangeFlash: true,
				rowSpan: (params: RowSpanParams) => {
					const rowIndex = params.node?.rowIndex;
					const isPinnedRow = params.node?.rowPinned === "bottom";
					if (rowIndex === 1 && isPinnedRow) {
						return 2;
					} else if (rowIndex === 0 && isPinnedRow) {
						return 0;
					}
					return 1;
				},
				valueGetter: calcTotalHours,
				valueFormatter: (params: ValueFormatterParams) => {
					return params.value > 0 ? `${params.value.toFixed(2)}` : "";
				},
			},
			{
				headerName: "Total Dollars",
				field: "total_dollars",
				editable: false,
				cellStyle: { textAlign: "center" },
				enableCellChangeFlash: true,
				rowSpan: (params: RowSpanParams) => {
					const rowIndex = params.node?.rowIndex;
					const isPinnedRow = params.node?.rowPinned === "bottom";

					if (rowIndex === 1 && isPinnedRow) {
						return 2;
					} else if (rowIndex === 0 && isPinnedRow) {
						return 0;
					}
					return 1;
				},
				valueGetter: calcTotalDollars,
				valueFormatter: (params: ValueFormatterParams) => {
					return params.value > 0 ? formatDollars(params.value) : "";
				},
			},
		];
	});

	const columnDefs = useMemo(() => {
		return [...baseColumn, ...teamColumn, ...totalsColumn];
	}, [baseColumn, teamColumn, totalsColumn]);

	// const [columnDefs, setColumnDefs] = useState(() => {
	// 	const baseColumns: ColDef[] = [
	// 		{
	// 			headerName: "Task",
	// 			field: "task",
	// 			type: "text",
	// 			editable: true,
	// 			colSpan: (params: ColSpanParams) => {
	// 				if (params.node?.rowPinned) {
	// 					return 2;
	// 				}
	// 				return 1;
	// 			},
	// 			cellStyle: (params) => {
	// 				if (params.node.rowPinned) {
	// 					return {
	// 						textAlign: "right",
	// 					};
	// 				}
	// 				return null;
	// 			},
	// 		},
	// 		{
	// 			headerName: "Notes",
	// 			field: "notes",
	// 			type: "text",
	// 			editable: true,
	// 		},
	// 	];

	// 	const teamMemberColumns: ColDef[] = teamMembers.map((member) => ({
	// 		headerName: member.rate_level_code,
	// 		field: member.id,
	// 		editable: true,
	// 		cellStyle: { textAlign: "center" },
	// 		valueParser: (params: ValueParserParams) => {
	// 			const newValue = params.newValue;
	// 			return typeof newValue === "string"
	// 				? newValue
	// 				: Number(newValue);
	// 		},
	// 		onCellValueChanged: (params) => {
	// 			const updatedRowData = [...rowData];
	// 			setRowData(updatedRowData);
	// 		},
	// 	}));

	// 	const totalsColumns: ColDef[] = [
	// 		{
	// 			headerName: "Total Hours",
	// 			field: "total_hours",
	// 			editable: false,
	// 			cellStyle: { textAlign: "center" },
	// 			enableCellChangeFlash: true,
	// 			rowSpan: (params: RowSpanParams) => {
	// 				const rowIndex = params.node?.rowIndex;
	// 				const isPinnedRow = params.node?.rowPinned === "bottom";
	// 				if (rowIndex === 1 && isPinnedRow) {
	// 					return 2;
	// 				} else if (rowIndex === 0 && isPinnedRow) {
	// 					return 0;
	// 				}
	// 				return 1;
	// 			},
	// 			valueGetter: calcTotalHours,
	// 			valueFormatter: (params: ValueFormatterParams) => {
	// 				return params.value > 0 ? `${params.value.toFixed(2)}` : "";
	// 			},
	// 		},
	// 		{
	// 			headerName: "Total Dollars",
	// 			field: "total_dollars",
	// 			editable: false,
	// 			cellStyle: { textAlign: "center" },
	// 			// cellStyle: (params) => {
	// 			// 	const rowIndex = params.node?.rowIndex;
	// 			// 	const isPinnedRow = params.node?.rowPinned === "bottom";
	// 			// 	if (rowIndex === 0 && isPinnedRow) {
	// 			// 		return {
	// 			// 			display: "none",
	// 			// 		};
	// 			// 	}
	// 			// },
	// 			enableCellChangeFlash: true,
	// 			rowSpan: (params: RowSpanParams) => {
	// 				const rowIndex = params.node?.rowIndex;
	// 				const isPinnedRow = params.node?.rowPinned === "bottom";

	// 				if (rowIndex === 1 && isPinnedRow) {
	// 					return 2;
	// 				} else if (rowIndex === 0 && isPinnedRow) {
	// 					return 0;
	// 				}
	// 				return 1;
	// 			},
	// 			valueGetter: calcTotalDollars,
	// 			valueFormatter: (params: ValueFormatterParams) => {
	// 				return params.value > 0 ? formatDollars(params.value) : "";
	// 			},
	// 		},
	// 	];

	// 	return [...baseColumns, ...teamMemberColumns, ...totalsColumns];
	// });

	// const columnDefs = useMemo(() => {
	// 	const baseColumns: ColDef[] = [
	// 		{
	// 			headerName: "Task",
	// 			field: "task",
	// 			type: "text",
	// 			editable: true,
	// 			colSpan: (params: ColSpanParams) => {
	// 				if (params.node?.rowPinned) {
	// 					return 2;
	// 				}
	// 				return 1;
	// 			},
	// 			cellStyle: (params) => {
	// 				if (params.node.rowPinned) {
	// 					return {
	// 						textAlign: "right",
	// 					};
	// 				}
	// 				return null;
	// 			},
	// 		},
	// 		{
	// 			headerName: "Notes",
	// 			field: "notes",
	// 			type: "text",
	// 			editable: true,
	// 		},
	// 	];

	// 	const teamMemberColumns: ColDef[] = teamMembers.map((member) => ({
	// 		headerName: member.rate_level_code,
	// 		field: member.id,
	// 		editable: true,
	// 		cellStyle: { textAlign: "center" },
	// 		valueParser: (params: ValueParserParams) => {
	// 			const newValue = params.newValue;
	// 			return typeof newValue === "string"
	// 				? newValue
	// 				: Number(newValue);
	// 		},
	// 		onCellValueChanged: (params) => {
	// 			const updatedRowData = [...rowData];
	// 			setRowData(updatedRowData);
	// 		},
	// 	}));

	// 	console.log(teamMemberColumns)
	// 	const totalsColumns: ColDef[] = [
	// 		{
	// 			headerName: "Total Hours",
	// 			field: "total_hours",
	// 			editable: false,
	// 			cellStyle: { textAlign: "center" },
	// 			enableCellChangeFlash: true,
	// 			rowSpan: (params: RowSpanParams) => {
	// 				const rowIndex = params.node?.rowIndex;
	// 				const isPinnedRow = params.node?.rowPinned === "bottom";
	// 				if (rowIndex === 1 && isPinnedRow) {
	// 					return 2;
	// 				} else if (rowIndex === 0 && isPinnedRow) {
	// 					return 0;
	// 				}
	// 				return 1;
	// 			},
	// 			valueGetter: calcTotalHours,
	// 			valueFormatter: (params: ValueFormatterParams) => {
	// 				return params.value > 0 ? `${params.value.toFixed(2)}` : "";
	// 			},
	// 		},
	// 		{
	// 			headerName: "Total Dollars",
	// 			field: "total_dollars",
	// 			editable: false,
	// 			cellStyle: { textAlign: "center" },
	// 			// cellStyle: (params) => {
	// 			// 	const rowIndex = params.node?.rowIndex;
	// 			// 	const isPinnedRow = params.node?.rowPinned === "bottom";
	// 			// 	if (rowIndex === 0 && isPinnedRow) {
	// 			// 		return {
	// 			// 			display: "none",
	// 			// 		};
	// 			// 	}
	// 			// },
	// 			enableCellChangeFlash: true,
	// 			rowSpan: (params: RowSpanParams) => {
	// 				const rowIndex = params.node?.rowIndex;
	// 				const isPinnedRow = params.node?.rowPinned === "bottom";

	// 				if (rowIndex === 1 && isPinnedRow) {
	// 					return 2;
	// 				} else if (rowIndex === 0 && isPinnedRow) {
	// 					return 0;
	// 				}
	// 				return 1;
	// 			},
	// 			valueGetter: calcTotalDollars,
	// 			valueFormatter: (params: ValueFormatterParams) => {
	// 				return params.value > 0 ? formatDollars(params.value) : "";
	// 			},
	// 		},
	// 	];

	// 	return [...baseColumns, ...teamMemberColumns, ...totalsColumns];
	// }, [teamMembers]);

	const pinnedTotals: Record<string, number | string>[] = useMemo(() => {
		const editableFields: string[] = columnDefs
			.filter(
				(col): col is { field: string } =>
					col.editable === true &&
					typeof col.field === "string" &&
					col.type !== "text"
			)
			.map((col) => col.field);

		const totals = editableFields.reduce((acc, field) => {
			acc[field] = rowData.reduce((sum, row) => {
				const value = Number(row[field] || 0);
				return sum + value;
			}, 0);

			return acc;
		}, {} as Record<string, number>);
		const totalsArray = Object.entries(totals).map(([key, value]) => ({
			key,
			value: Number(value),
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
				task: "Total Hours",
				...totalsArray.reduce((acc, { key, value }) => {
					acc[key] = value;
					return acc;
				}, {} as Record<string, number>),
			},
			{
				task: "Total Dollars",
				...Object.entries(result).reduce((acc, [key, value]) => {
					acc[key] = formatDollars(value);
					return acc;
				}, {} as Record<string, string>),
			},
		];
	}, [columnDefs, teamMembers, rateLevel, rowData]);

	const gridOptions: GridOptions = {
		theme: getTheme(theme),
		rowData: rowData,
		columnDefs: columnDefs,
		defaultColDef: defaultColDef,
		suppressRowTransform: true,
		columnTypes: {
			text: {
				valueFormatter: (params: ValueFormatterParams) => {
					return params.value ? String(params.value) : "";
				},
			},
		},
	};

	const handleMemberAdd = useCallback(() => {
		const newMember = addTeamMember[0];
		const newMemberColumn: ColDef = {
			headerName: newMember.rate_level_code,
			field: newMember.id,
			editable: true,
			cellStyle: { textAlign: "center" },
			valueParser: (params: ValueParserParams) =>
				Number(params.newValue) || 0,
			onCellValueChanged: (params) => {
				const updatedRowData = [...rowData];
				setRowData(updatedRowData);
			},
		};
		setTeamColumn((prev) => {
			const updatedTeamColumns = [...prev, newMemberColumn];
			const updatedColumnDefs = [
				...baseColumn,
				...updatedTeamColumns,
				...totalsColumn,
			];
			gridRef.current!.api.setGridOption("columnDefs", updatedColumnDefs);
			return updatedColumnDefs;
		});

		console.log(columnDefs);

		// gridRef.current!.api.moveColumnByIndex(5, 3);

		setTeamMembers((prev) => [...prev, newMember]);
	}, [
		addTeamMember,
		baseColumn,
		totalsColumn,
		rowData,
		setTeamColumn,
		setTeamMembers,
	]);

	const sizeToFit = useCallback(() => {
		if (gridRef.current) {
			gridRef.current.api.sizeColumnsToFit();
		}
	}, [gridRef, columnDefs]);

	return (
		<>
			<div className="flex flex-col gap-2 w-full">
				<div>
					<Button onClick={handleMemberAdd}>Add team Member</Button>
				</div>
				<div style={containerStyle}>
					<div style={gridStyle}>
						<AgGridReact
							gridId="grid"
							ref={gridRef}
							gridOptions={gridOptions}
							// autoSizeStrategy={{ type: "fitCellContents" }}
							enterNavigatesVertically={true}
							enterNavigatesVerticallyAfterEdit={true}
							pinnedBottomRowData={pinnedTotals}
							onGridReady={sizeToFit}
						/>
					</div>
				</div>
			</div>
		</>
	);
}
