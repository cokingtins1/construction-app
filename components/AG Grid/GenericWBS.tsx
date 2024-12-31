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
import { AgGridReact, CustomCellRendererProps } from "ag-grid-react";
import { getTheme } from "@/lib/context/theme";
import {
	// baseId,
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
import { DB_DATA } from "@/app/(routes)/ag-grid/data";
import { Button } from "../ui/button";
import { useTheme } from "@/lib/context/theme-context";
import CustomHeader from "./TeamMemberHeader";
import TeamMemberHeader from "./TeamMemberHeader";

ModuleRegistry.registerModules([AllCommunityModule]);

function baseId(id: string | undefined) {
	return id?.split("_")[0];
}

export default function GenericWBS() {
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

	const [teamMembers, setTeamMembers] = useState(() => DB_DATA.teamMembers);
	const [lastRow, setLastRow] = useState(WBSActivities.length - 1 || 0);

	const [assignments, setAssignments] = useState(
		() => DB_DATA.WBSAssignments
	);

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

	const [rowData, setRowData] = useState(() =>
		prepareGridData(WBSActivities, assignments)
	);

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

			console.log("Before assigning values:", row);

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

			console.log("After assigning values:", row);

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

	const getMemberName = useCallback(
		(currentMembers: TeamMember[], newMemberId: string | undefined) => {
			return currentMembers.find(
				(m) => baseId(m.id) === baseId(newMemberId)
			)?.last_name;
		},
		[teamMembers]
	);

	const handleTeamMemberChange = (
		oldMemberId: string,
		newMemberId: string
	) => {
		if (!gridRef.current) return;

		const currentCols: ColDef[] | undefined =
			gridRef.current.api.getColumnDefs();
		if (!currentCols) return;

		// Find the exact column that's changing using both the base ID and any potential suffix
		const columnIndex = currentCols.findIndex(
			(col) => col.colId === oldMemberId
		);

		if (columnIndex === -1) return;

		// Get existing columns with the new member ID
		const existingColumns = currentCols.filter(
			(col) => baseId(col.field) === baseId(newMemberId)
		);

		// 		console.log(
		// 	"newMemberId:",
		// 	getMemberName(teamMembers, newMemberId),
		// 	"currentColId:",
		// 	getMemberName(teamMembers, currentColId as string)
		// );

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

		const newTeamMember = DB_DATA.teamMembers.find(
			(m) => m.id === baseId(newMemberId)
		);
		if (!newTeamMember) return;

		setTeamMembers((prevTeamMembers) => {
			return prevTeamMembers.map((member, idx) => {
				if (member.id === oldMemberId) {
					return {
						...DB_DATA.teamMembers.find(
							(m) => m.id === baseId(newMemberId)
						)!,
						id: newField,
					};
				}
				return member;
			});
		});

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
				},
			};
		});

		setRowData((prevRowData) => {
			return prevRowData.map((row) => {
				const newRow = { ...row };
				newRow[newField] = row[oldMemberId] || 0;
				delete newRow[oldMemberId];
				return newRow;
			});
		});

		gridRef.current.api.setGridOption("columnDefs", updatedColumns);
	};

	const createTeamMemberCol = (teamMembers: TeamMember[]): ColDef[] => {
		return teamMembers.map((member, index) => {
			const fieldId = getColIdForTeamMember(teamMembers, index);
			return {
				field: fieldId,
				colId: fieldId,
				headerComponent: TeamMemberHeader,
				headerComponentParams: {
					teamMembers,
					currentMemberId: member.id,
					onTeamMemberChange: handleTeamMemberChange,
				},
				cellEditor: "agNumberCellEditor",
				editable: true,
				cellStyle: { textAlign: "center" },
				valueParser: (params: ValueParserParams) => {
					const newValue = params.newValue;
					return typeof newValue === "string"
						? newValue
						: Number(newValue);
				},
				valueFormatter: (params: ValueFormatterParams) => {
					// console.log("params.value:", params.value);
					return params.value === 0 ? "" : params.value;
				},
				onCellValueChanged: (params: NewValueParams) => {
					const fieldName = params.column.getColId();
					const newValue = Number(params.newValue) || 0;

					setRowData((prevData) => {
						return prevData.map((row) => {
							if (row.id === params.data.id) {
								return {
									...row,
									[fieldName]: newValue,
								};
							}
							return row;
						});
					});
				},
			};
		});
	};

	const calcTotalHours = (params: ValueGetterParams) => {
		if (params.data.task === "Total Dollars") return null;

		const teamMemberFields = Object.keys(params.data).filter((key) => {
			// Remove any _1, _2 suffixes to get the base member ID
			// const baseId = key.split("_")[0];
			return teamMembers.some((member) => member.id === key);
		});

		return teamMemberFields.reduce((sum, field) => {
			if (field === "232ab19b-9b76-6c77-b62e-6735178a9c7c_1") {
				// console.log("hours:", params.data[field]);
			}
			return sum + (Number(params.data[field]) || 0);
		}, 0);
	};

	const calcTotalDollars = useCallback(
		(params: ValueGetterParams) => {
			if (params.data.task === "Total Dollars") {
				return Object.entries(
					params.data as Record<string, string>
				).reduce(
					(sum, [key, value]) => sum + convertCurrencyToNum(value),
					0
				);
			} else if (params.data.task === "Total Hours") {
				return null;
			} else {
				// Get all data fields that correspond to team member columns
				const teamMemberFields = Object.keys(params.data).filter(
					(key) => {
						return teamMembers.some((member) => member.id === key);
					}
				);

				return teamMemberFields.reduce((sum, field) => {
					const hours = Number(params.data[field]) || 0;
					// Get base member ID without any suffix
					const baseMemberId = field.split("_")[0];
					const member = teamMembers.find(
						(m) => m.id === baseMemberId
					);
					const rateInfo = member
						? rateLevel.find(
								(r) => r.code === member.rate_level_code
						  )
						: null;
					const rate = rateInfo ? rateInfo.rate : 0;
					return sum + hours * rate;
				}, 0);
			}
		},
		[teamMembers, rateLevel]
	);

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
				valueGetter: calcTotalDollars,
				valueFormatter: (params: ValueFormatterParams) => {
					return params.value > 0 ? formatDollars(params.value) : "";
				},
			},
		];

		return [...baseColumns, ...teamColumns, ...totalsColumns];
	}, [teamMembers, calcTotalHours, calcTotalDollars, rowData]);

	const pinnedTotals = useMemo(() => {
		// Create a mapping of member positions to their column IDs
		const memberColumns = teamMembers.map((member, index) => ({
			colId: getColIdForTeamMember(teamMembers, index),
			member,
		}));

		console.log(
			"memberColumns:",
			memberColumns.map((m) => m.member.last_name)
		);
		console.log("rowData:", rowData);
		// Calculate hours totals for each column
		const hoursTotals = memberColumns.reduce((acc, { colId }) => {
			acc[colId] = rowData.reduce(
				(sum, row) => sum + (Number(row[colId]) || 0),
				0
			);
			return acc;
		}, {} as Record<string, number>);

		// Calculate dollar totals for each column
		const dollarTotals = memberColumns.reduce((acc, { colId, member }) => {
			const memberRate =
				rateLevel.find((r) => r.code === member.rate_level_code)
					?.rate || 0;
			const hours = hoursTotals[colId];
			acc[colId] = formatDollars(hours * memberRate);
			return acc;
		}, {} as Record<string, string>);

		return [
			{ task: "Total Hours", ...hoursTotals },
			{ task: "Total Dollars", ...dollarTotals },
		];
	}, [rowData, teamMembers, rateLevel]);

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

	const returnCols = (colArr: ColDef[]) => {
		console.log(
			colArr
				.map((col) => {
					const name = getMemberName(teamMembers, col.field);
					return {
						name: name,
						field: col.field,
						colId: col.colId,
					};
				})
				.slice(2, colArr.length - 2)
		);
	};

	const getColDefs = () => {
		if (gridRef.current) {
			const currentCols: ColDef[] | undefined =
				gridRef.current.api.getColumnDefs();

			if (!currentCols) return;

			console.log("currentCols:", returnCols(currentCols));
			console.log("rowData:", rowData);
			console.log("pinnedTotals:", pinnedTotals);
		}
	};

	const handleAddTeamMember = useCallback(() => {
		const newMember = addTeamMember[0];
		const updatedTeamMembers = [...teamMembers, newMember];

		setRowData((currentRows) =>
			currentRows.map((row) => ({
				...row,
				[newMember.id]: 0,
			}))
		);

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
	}, [teamMembers, rowData]);

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
			setRowData((prevRowData) => [...prevRowData, newRow]);
			setLastRow((prev) => prev + 1);

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
						pinnedBottomRowData={pinnedTotals}
						onGridReady={sizeToFit}
						rowDragManaged={true}
					/>
				</div>
			</div>
		</div>
	);
}
