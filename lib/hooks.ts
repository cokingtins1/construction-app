import { RateLevel } from "@prisma/client";
import { useMemo } from "react";
import { getRateByEmpId, isUUID } from "./utils";
import TeamMemberHeader from "@/components/AG Grid/TeamMemberHeader";

interface Column {
	id: string;
}

interface GridData {
	rowData: Record<string, any>[];
	colData: Column[];
}

// Memoized helper functions
const calculateRowTotals = (
	row: Record<string, any>,
	columns: Column[],
	rates: number[]
) => {
	let hours = 0;
	let dollars = 0;

	columns.forEach((col, index) => {
		const value = (row[col.id] as number) || 0;
		hours += value;
		dollars += value * (rates[index] || 1);
	});

	return { hours, dollars };
};

// Main hook for grid calculations
export const useGridCalculations = (
	gridRef: React.RefObject<any>,
	initialRowData: Record<string, any>[],
	teamMembers: any[],
	rateLevel: RateLevel[]
) => {
	// Memoize the grid data retrieval
	const gridData = useMemo<GridData>(() => {
		if (!gridRef.current?.api) {
			const colData = Object.entries(initialRowData[0])
				.filter(([key]) => isUUID(key))
				.map(([key]) => ({ id: key }));

			return { rowData: initialRowData, colData };
		}

		const rowData: Record<string, any>[] = [];
		gridRef.current.api.forEachNode((node: any) => rowData.push(node.data));

		const colData = gridRef.current.api
			.getAllGridColumns()
			?.filter(
				(col: any) =>
					col.getColDef().headerComponent === TeamMemberHeader
			)
			.map((col: any) => ({ id: col.getColId() }));

		return { rowData, colData };
	}, [gridRef.current?.api, initialRowData]);

	// Memoize rates calculation
	const columnRates = useMemo(
		() =>
			gridData.colData.map((col) =>
				getRateByEmpId(col.id, teamMembers, rateLevel)
			),
		[gridData.colData, teamMembers, rateLevel]
	);

	// Memoize all sum calculations
	const calculations = useMemo(() => {
		const rowSums: Record<string, number> = {};
		const rowSumDollars: Record<string, number> = {};
		const colSums: Record<string, number> = {};
		const colSumDollars: Record<string, number> = {};

		// Initialize column sums
		gridData.colData.forEach((col) => {
			colSums[col.id] = 0;
			colSumDollars[col.id] = 0;
		});

		// Calculate all sums in a single pass through the rows
		gridData.rowData.forEach((row) => {
			const totals = calculateRowTotals(
				row,
				gridData.colData,
				columnRates
			);

			rowSums[row.id] = totals.hours;
			rowSumDollars[row.id] = totals.dollars;

			// Update column sums
			gridData.colData.forEach((col, index) => {
				const value = (row[col.id] as number) || 0;
				colSums[col.id] += value;
				colSumDollars[col.id] += value * (columnRates[index] || 1);
			});
		});

		// Calculate final totals
		const totalHours = Object.values(colSums).reduce(
			(sum, value) => sum + value,
			0
		);
		const totalDollars = Object.values(colSumDollars).reduce(
			(sum, value) => sum + value,
			0
		);

		return {
			rowSum: rowSums,
			rowSumDollars: rowSumDollars,
			colSum: colSums,
			colSumDollars: colSumDollars,
			totalDollars,
			totalHours,
		};
	}, [gridData, columnRates]);

	return calculations;
};
