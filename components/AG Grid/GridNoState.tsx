"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
	CellChangedEvent,
	CellClassParams,
	CellPosition,
	CellRendererSelectorFunc,
	CellStyle,
	CellStyleFunc,
	CellValueChangedEvent,
	ColDef,
	ColGroupDef,
	ColSpanParams,
	GetCellValueParams,
	GridApi,
	GridOptions,
	ICellRendererParams,
	NavigateToNextCellParams,
	NewValueParams,
	RowNode,
	RowSpanParams,
	SuppressKeyboardEventParams,
	TabToNextCellParams,
	ValueFormatterLiteParams,
	ValueFormatterParams,
	ValueGetterParams,
	ValueParserParams,
	ValueSetterParams,
} from "ag-grid-community";
import {
	AllCommunityModule,
	colorSchemeDarkBlue,
	ModuleRegistry,
	themeQuartz,
} from "ag-grid-community";
import { AgGridReact, CustomCellRendererProps } from "ag-grid-react";
import { getTheme } from "@/lib/context/theme";
import {
	// baseId,
	convertCurrencyToNum,
	formatDollars,
	getRateByEmpId,
	isUUID,
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
import { DB_DATA } from "@/app/(routes)/ag-grid/data";
import { Button } from "../ui/button";
import { useTheme } from "@/lib/context/theme-context";
import CustomHeader from "./TeamMemberHeader";
import TeamMemberHeader from "./TeamMemberHeader";

ModuleRegistry.registerModules([AllCommunityModule]);

function baseId(id: string | undefined) {
	return id?.split("_")[0];
}

export default function GridNoState() {
	const { theme } = useTheme();

	const {
		rateLevel,
		WBSAssignments,
		WBSActivities,
		addTeamMember,
		addActivity,
	} = useMemo(() => {
		return DB_DATA;
	}, []);

	const [teamMembers, setTeamMembers] = useState(
		() => DB_DATA.DB_teamMembers
	);

	const [assignments, setAssignments] = useState(
		() => DB_DATA.WBSAssignments
	);
	const gridRef = useRef<AgGridReact>(null);

	const [triggerRecalc, setTriggerRecalc] = useState(0);

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

	const sizeToFit = useCallback(() => {
		if (gridRef.current) {
			gridRef.current.api.sizeColumnsToFit();
		}
	}, [gridRef]);

	const getColIdForTeamMember = (
		teamMembers: TeamMember[],
		currentIndex: number
	): string => {
		const currentMember = teamMembers[currentIndex];
		const previousOccurrences = teamMembers
			.slice(0, currentIndex)
			.filter((m) => m.id === currentMember.id).length;

		return previousOccurrences === 0
			? currentMember.id
			: `${currentMember.id}_${previousOccurrences}`;
	};

	const [initialRowData] = useState(() =>
		prepareGridData(WBSActivities, assignments)
	);

	const getRowData = useCallback(() => {
		if (!gridRef.current?.api) return initialRowData;

		let rowData: any[] = [];
		gridRef.current.api.forEachNode((node) => rowData.push(node.data));

		return rowData;
	}, [initialRowData]);

	function getGridData() {
		if (!gridRef.current) {
			const colData = Object.entries(initialRowData[0])
				.filter(([key]) => isUUID(key))
				.map(([key, value]) => ({
					id: key,
				}));

			return { rowData: initialRowData, colData: colData };
		} else {
			let rowData: any[] = [];
			gridRef.current.api?.forEachNode((node) => rowData.push(node.data));

			const colData = gridRef.current.api
				?.getAllGridColumns()
				?.filter(
					(col) =>
						col.getColDef().headerComponent === TeamMemberHeader
				)
				.map((col) => {
					return { id: col.getColId() };
				});

			return {
				rowData: rowData.length > 0 ? rowData : initialRowData,
				colData: colData,
			};
		}
	}

	function calculateSums(columns: any[], rows: any[]) {
		const columnRates = columns?.map((col) =>
			getRateByEmpId(col.id, teamMembers, rateLevel)
		);

		// Helper function for row calculations
		const calculateRowTotals = (includeRates: boolean) => {
			return rows?.reduce<Record<string, number>>((acc, row) => {
				const sum = columns?.reduce((total, col, index) => {
					const value = row[col.id] as number;
					const rate = includeRates ? columnRates?.[index] || 1 : 1;
					return total + value * rate;
				}, 0);

				if (sum !== undefined) {
					acc[row.id] = sum;
				}
				return acc;
			}, {});
		};

		// Helper function for column calculations
		const calculateColumnTotals = (includeRates: boolean) => {
			return columns?.reduce<Record<string, number>>(
				(acc, col, colIndex) => {
					const sum = rows?.reduce((total, row) => {
						const value = row[col.id] as number;
						const rate = includeRates
							? columnRates?.[colIndex] || 1
							: 1;
						return total + value * rate;
					}, 0);

					if (sum !== undefined) {
						acc[col.id] = sum;
					}
					return acc;
				},
				{}
			);
		};

		const rowSums = calculateRowTotals(false);
		const rowSumDollars = calculateRowTotals(true);
		const columnSums = calculateColumnTotals(false);
		const colSumDollars = calculateColumnTotals(true);

		const totalDollars = colSumDollars
			? Object.values(colSumDollars).reduce(
					(sum, value) => sum + value,
					0
			  )
			: 0;

		const totalHours = columnSums
			? Object.values(columnSums).reduce((sum, value) => sum + value, 0)
			: 0;

		return {
			rowSum: rowSums,
			rowSumDollars,
			colSum: columnSums,
			colSumDollars,
			totalDollars,
			totalHours,
		};
	}

	function prepareGridData(
		row_data: WBSActivity[],
		col_data: WBSAssignment[]
	) {
		// Create mapping of team members to their column IDs based on their position in the array
		const memberToColIds = new Map<string, string[]>();

		teamMembers.forEach((member, index) => {
			const colId = getColIdForTeamMember(teamMembers, index);
			const existing = memberToColIds.get(member.id) || [];
			memberToColIds.set(member.id, [...existing, colId]);
		});

		return row_data.map((activity) => {
			const activityAssignments = col_data.filter(
				(a) => a.wbs_activity_id === activity.id
			);

			const row: any = {
				id: activity.id,
				task: activity.task,
				notes: activity.notes,
			};

			// Group assignments by team member ID
			const assignmentsByMember = activityAssignments.reduce(
				(acc, assignment) => {
					const existing = acc.get(assignment.team_member_id) || [];
					acc.set(assignment.team_member_id, [
						...existing,
						assignment,
					]);
					return acc;
				},
				new Map<string, WBSAssignment[]>()
			);

			// Process each team member's assignments
			memberToColIds.forEach((colIds, memberId) => {
				const memberAssignments =
					assignmentsByMember.get(memberId) || [];

				// Assign hours to each column for this member
				colIds.forEach((colId, index) => {
					const assignment = memberAssignments[index];
					row[colId] = assignment ? assignment.hours : 0;
				});
			});

			// Calculate totals
			row.total_hours = activityAssignments.reduce(
				(sum, a) => sum + a.hours,
				0
			);
			row.total_dollars = activityAssignments.reduce(
				(sum, a) => sum + a.hours * a.rate,
				0
			);
			return row;
		});
	}

	const handleTeamMemberChange = (
		oldMemberId: string,
		newMemberId: string,
		rowData: any[]
	) => {
		if (!gridRef.current) return;

		const currentCols: ColDef[] | undefined =
			gridRef.current.api.getColumnDefs();
		if (!currentCols) return;

		// Find the exact column that's changing using both the base ID and any potential suffix
		// oldMemberId = "232ab19b-9b76-6c77-b62e-6735178a9c7c_1";
		console.log(oldMemberId, newMemberId);
		const columnIndex = currentCols.findIndex(
			(col) => col.colId === oldMemberId
		);
		console.log(rowData);

		if (columnIndex === -1) return;

		// Get existing columns with the new member ID
		const existingColumns = currentCols.filter(
			(col) => baseId(col.field) === baseId(newMemberId)
		);

		// Create new unique identifier
		let newField = newMemberId;
		if (existingColumns.length > 0) {
			// Find the highest existing suffix number
			const maxSuffix = existingColumns.reduce((max, col) => {
				const suffix = col.field?.split("_")[1];
				return suffix ? Math.max(max, parseInt(suffix)) : 0;
			}, 0);
			newField = `${newMemberId}_${maxSuffix + 1}`;
		}

		const newTeamMember = DB_DATA.DB_teamMembers.find(
			(m) => m.id === baseId(newMemberId)
		);
		if (!newTeamMember) return;

		// Update columns
		const updatedColumns = currentCols.map((col, index) => {
			if (index !== columnIndex) return col;

			return {
				...col,
				field: newField,
				colId: newField,
				headerComponentParams: {
					...col.headerComponentParams,
					currentMemberId: newField,
					rowData,
				},
			};
		});

		console.log("updatedColumns:", updatedColumns);

		const gridRowData = getRowData();
		const updatedRowData = gridRowData?.map((row) => {
			const newRow = { ...row };
			newRow[newField] = row[oldMemberId] || 0;
			delete newRow[oldMemberId];
			return newRow;
		});

		gridRef.current.api.setGridOption("rowData", updatedRowData);
		gridRef.current.api.setGridOption("columnDefs", updatedColumns); // good

		setTeamMembers((prevTeamMembers) => {
			return prevTeamMembers.map((member, idx) => {
				if (member.id === oldMemberId) {
					return {
						...DB_DATA.DB_teamMembers.find(
							(m) => m.id === baseId(newMemberId)
						)!,
						id: newField,
					};
				}
				return member;
			});
		});
	};

	const createTeamMemberCol = (teamMembers: TeamMember[]): ColDef[] => {
		return teamMembers.map((member, index) => {
			const fieldId = getColIdForTeamMember(teamMembers, index);
			const rowData = getRowData();
			return {
				field: fieldId,
				colId: fieldId,
				headerComponent: TeamMemberHeader,
				headerComponentParams: {
					rowdata: rowData,
					teamMembers,
					currentMemberId: member.id,
					onTeamMemberChange: handleTeamMemberChange,
					gridRef
				},
				cellEditor: "agNumberCellEditor",
				editable: true,
				cellStyle: { textAlign: "center" },
				valueGetter: (params: ValueGetterParams) => {
					const { colData, rowData } = getGridData();
					const { colSum, colSumDollars } = calculateSums(
						colData,
						rowData
					);

					if (params.node?.rowPinned === "bottom") {
						return params.data.task === "Total Hours"
							? colSum[params.column.getColId()]
							: formatDollars(
									colSumDollars[params.column.getColId()]
							  );
					}
					return params.data[params.column.getColId()] || 0;
				},
				valueParser: (params: ValueParserParams) => {
					const newValue = params.newValue;
					return typeof newValue === "string"
						? parseFloat(newValue)
						: Number(newValue);
				},
				valueFormatter: (params: ValueFormatterParams) => {
					const value = params.value;
					return value === 0 || value === undefined
						? ""
						: value.toString();
				},
			};
		});
	};

	const columnDefs = useMemo(() => {
		const baseColumns: ColDef[] = [
			{
				headerName: "Task",
				field: "task",
				type: "text",
				rowDrag: true,
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

		const teamColumns: ColDef[] = createTeamMemberCol(teamMembers);

		const totalsColumns: ColDef[] = [
			{
				headerName: "Total Hours",
				field: "total_hours",
				editable: false,
				cellStyle: { textAlign: "center" },
				enableCellChangeFlash: true,
				valueGetter: (params: ValueGetterParams) => {
					const { colData, rowData } = getGridData();
					const { rowSum, totalHours } = calculateSums(
						colData,
						rowData
					);
					if (
						params.node?.rowPinned === "bottom" &&
						params.data.task === "Total Hours"
					) {
						return totalHours;
					}
					return rowSum[params.data.id];
				},
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
				valueGetter: (params: ValueGetterParams) => {
					const { colData, rowData } = getGridData();
					const { rowSumDollars, totalDollars } = calculateSums(
						colData,
						rowData
					);
					if (
						params.node?.rowPinned === "bottom" &&
						params.data.task === "Total Dollars"
					) {
						return totalDollars;
					}
					return rowSumDollars[params.data.id];
				},
				valueFormatter: (params: ValueFormatterParams) => {
					return params.value > 0 ? formatDollars(params.value) : "";
				},
			},
		];

		return [...baseColumns, ...teamColumns, ...totalsColumns];
	}, [teamMembers, triggerRecalc]);

	const gridOptions: GridOptions = {
		theme: getTheme(theme),
		rowData: initialRowData,
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

	const getColDefs = () => {
		if (gridRef.current) {
			const currentCols: ColDef[] | undefined =
				gridRef.current.api.getColumnDefs();

			if (!currentCols) return;

			console.log(
				"column object:",
				currentCols.map((col) => {
					return { field: col.field, id: col.colId };
				})
			);

			const rowData = getRowData();
			console.log("rows object:", rowData);
		}
	};

	const handleAddTeamMember = useCallback(() => {
		const newMember = addTeamMember[0];
		const updatedTeamMembers = [...teamMembers, newMember];

		setTeamMembers(updatedTeamMembers);

		if (gridRef.current) {
			const currentColumns = gridRef.current.api.getColumnDefs();

			if (currentColumns) {
				const totalColumnsIndex = currentColumns.length - 2;
				const newTeamColumn =
					createTeamMemberCol(updatedTeamMembers)[
						updatedTeamMembers.length - 1
					];

				const newColumns = [
					...currentColumns.slice(0, totalColumnsIndex),
					newTeamColumn,
					...currentColumns.slice(totalColumnsIndex),
				];

				gridRef.current.api.setGridOption("columnDefs", newColumns);
				sizeToFit();
			}
		}
	}, [teamMembers]);

	const handleAddActivity = useCallback(() => {
		if (gridRef.current) {
			const newRowId = crypto.randomUUID();
			const rowTemplate: WBSActivity[] = [
				{
					id: newRowId,
					task: "",
					notes: "",
					total_dollars: 0,
					total_hours: 0,
					wbs_template_id: "cc84b70d-f83f-4458-b799-d82a9f9cad55",
				},
			];

			const newAssignment: WBSAssignment[] = teamMembers.map((mem) => {
				return {
					id: newRowId,
					wbs_activity_id: newRowId,
					team_member_id: mem.id,
					hours: 0,
					rate: getRateByEmpId(mem.id, teamMembers, rateLevel),
					total_dollars: 0,
					total_hours: 0,
				};
			});

			const updatedAssignments = [...assignments, ...newAssignment];
			setAssignments(updatedAssignments);

			const newRow = prepareGridData(rowTemplate, updatedAssignments)[0];

			gridRef.current.api.applyTransaction({ add: [newRow] });
		}
	}, [teamMembers, assignments, rateLevel]);

	return (
		<div className="flex flex-col gap-2 w-full">
			<div className="flex gap-4">
				<Button onClick={handleAddTeamMember}>Add team Member</Button>
				<Button onClick={handleAddActivity}>Add Activity</Button>
				<Button onClick={getColDefs}>Get Col Defs</Button>
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
						pinnedBottomRowData={[
							{ task: "Total Hours" },
							{ task: "Total Dollars" },
						]}
						onCellValueChanged={() =>
							setTriggerRecalc((prev) => prev + 1)
						}
						onGridReady={sizeToFit}
						rowDragManaged={true}
					/>
				</div>
			</div>
		</div>
	);
}
