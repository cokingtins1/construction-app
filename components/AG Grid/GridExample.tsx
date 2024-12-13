"use client";
import { useEffect, useMemo, useState } from "react";
import type { ColDef, RowSelectionOptions } from "ag-grid-community";
import {
	AllCommunityModule,
	colorSchemeDarkBlue,
	ModuleRegistry,
	themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { getTheme } from "@/lib/context/theme";
import { useTheme } from "@/lib/context/theme-context";
import server from "@/app/actions/serverActions";

ModuleRegistry.registerModules([AllCommunityModule]);

type IRow = {
	make: string;
	model: string;
	price: number;
	electric: boolean;
};

export default function GridExample() {
	const { theme } = useTheme();

	useEffect(() => {
		fetch("https://www.ag-grid.com/example-assets/space-mission-data.json") // Fetch data from server
			.then((result) => result.json()) // Convert to JSON
			.then((rowData) => setRowData(rowData)); // Update state of `rowData`
	}, []);

	const [rowData, setRowData] = useState<IRow[]>([]);
	const [colDefs, setColDefs] = useState<ColDef[]>([
		{ field: "mission" },
		{ field: "company" },
		{ field: "location" },
		{ field: "date" },
		{ field: "price" },
		{ field: "successful" },
		{ field: "rocket" },
	]);

	const defaultColDef: ColDef = {
		flex: 1,
		filter: true,
		editable: true,
	};

	const rowSelection = useMemo<
		RowSelectionOptions | "single" | "multiple"
	>(() => {
		return { mode: "multiRow" };
	}, []);

	// console.log(colDefs.map((row) => row. ))

	return (
		<div className="relative w-[1280px] h-full">
			<AgGridReact
				theme={getTheme(theme)}
				rowData={rowData}
				columnDefs={colDefs}
				defaultColDef={defaultColDef}
				rowSelection={rowSelection}
				onCellValueChanged={() => server()}
				onRowClicked={(event) => console.log("Custom Row ID:", event.node.id)}

			/>
		</div>
	);
}
