import { formatDollars, getRateByEmpId, isUUID } from "@/lib/utils";
import { DB_DATA, rateLevel, teamMembers } from "../ag-grid/data";
import { RateLevel, TeamMember } from "@prisma/client";
import { useMemo } from "react";

export default function Page() {
	type Columns = {
		id: string;
	};

	type Rows = {
		id: string;
		task: string;
		notes: string;
		[key: string]: string | number;
	};

	const columns: Columns[] = [
		{ id: "6e7b12ba-a897-e7d8-cb7a-5c4d251be342" },
		{ id: "86734044-2506-0262-10c7-d9e3b3023f4c" },
		{ id: "eb378bf7-8722-e411-e74c-9f34941ffc37" },
		{ id: "232ab19b-9b76-6c77-b62e-6735178a9c7c" },
		{ id: "232ab19b-9b76-6c77-b62e-6735178a9c7c_1" },
		{ id: "f3f907a8-8489-4324-da0f-4a2b9d90c15e" },
	];

	const rows = [
		{
			id: "0248fefa-5683-4657-b8cc-ba8c03415857",
			task: "Task 1",
			notes: "Notes for Task 1",
			"6e7b12ba-a897-e7d8-cb7a-5c4d251be342": 0,
			"86734044-2506-0262-10c7-d9e3b3023f4c": 30,
			"eb378bf7-8722-e411-e74c-9f34941ffc37": 0,
			"232ab19b-9b76-6c77-b62e-6735178a9c7c": 0,
			"232ab19b-9b76-6c77-b62e-6735178a9c7c_1": 0,
			"f3f907a8-8489-4324-da0f-4a2b9d90c15e": 0,
			total_hours: 30,
			total_dollars: 6000,
		},
		{
			id: "caa7acd5-2874-49d6-afd8-d9a99e82c907",
			task: "Task 2",
			notes: "Notes for Task 2",
			"6e7b12ba-a897-e7d8-cb7a-5c4d251be342": 30,
			"86734044-2506-0262-10c7-d9e3b3023f4c": 0,
			"eb378bf7-8722-e411-e74c-9f34941ffc37": 13,
			"232ab19b-9b76-6c77-b62e-6735178a9c7c": 24,
			"232ab19b-9b76-6c77-b62e-6735178a9c7c_1": 0,
			"f3f907a8-8489-4324-da0f-4a2b9d90c15e": 0,
			total_hours: 67,
			total_dollars: 13010,
		},
		{
			id: "e4235cc1-747c-4ad5-8380-52ce8b5c0b79",
			task: "Task 3",
			notes: "Notes for Task 3",
			"6e7b12ba-a897-e7d8-cb7a-5c4d251be342": 8,
			"86734044-2506-0262-10c7-d9e3b3023f4c": 11,
			"eb378bf7-8722-e411-e74c-9f34941ffc37": 30,
			"232ab19b-9b76-6c77-b62e-6735178a9c7c": 15,
			"232ab19b-9b76-6c77-b62e-6735178a9c7c_1": 88,
			"f3f907a8-8489-4324-da0f-4a2b9d90c15e": 0,
			total_hours: 152,
			total_dollars: 26915,
		},
		{
			id: "aae495ae-7a68-4537-8a21-0af6a2449fef",
			task: "Task 4",
			notes: "Notes for Task 4",
			"6e7b12ba-a897-e7d8-cb7a-5c4d251be342": 0,
			"86734044-2506-0262-10c7-d9e3b3023f4c": 20,
			"eb378bf7-8722-e411-e74c-9f34941ffc37": 0,
			"232ab19b-9b76-6c77-b62e-6735178a9c7c": 401,
			"232ab19b-9b76-6c77-b62e-6735178a9c7c_1": 400,
			"f3f907a8-8489-4324-da0f-4a2b9d90c15e": 1,
			total_hours: 822,
			total_dollars: 136235,
		},
	];

	function calcSum(columns: Columns[] | null, rows: Rows[]) {
		const employeeIds = columns
			?.map((column) => column.id)
			.filter((id) => isUUID(id));

		// Initialize column sums
		const columnSums: Record<string, number> = {};
		const colSumDollars: Record<string, string> = {};

		employeeIds?.forEach((id) => {
			columnSums[id] = 0;
			const rate = getRateByEmpId(id, teamMembers, rateLevel);
			colSumDollars[id] = "";
		});

		// Initialize row sums
		const rowSums: Record<string, number> = {};
		const rowSumDollars: Record<string, string> = {};

		rows.forEach((row) => {
			let rowSum = 0;
			let rowDollarSum = 0;

			employeeIds?.forEach((id) => {
				const value =
					typeof row[id] === "number" ? (row[id] as number) : 0;
				const rate = getRateByEmpId(id, teamMembers, rateLevel);

				columnSums[id] += value;
				rowSum += value;
				rowDollarSum += value * rate;
			});
			rowSums[row.id] = rowSum;
			rowSumDollars[row.id] = formatDollars(rowDollarSum);
		});

		employeeIds?.forEach((id) => {
			const rate = getRateByEmpId(id, teamMembers, rateLevel);
			colSumDollars[id] = formatDollars(columnSums[id] * rate);
		});

		// const colSumDollars = Object.values(columnSums).map((mem) => mem);

		return { columnSums, rowSums, colSumDollars, rowSumDollars };
	}

	// const { columnSums, rowSums, colSumDollars, rowSumDollars } = calcSum(
	// 	columns,
	// 	rows
	// );

	function calculateSums(columns?: Columns[], rows?: Rows[]) {
		const columnRates = columns?.map((col) =>
			getRateByEmpId(col.id, teamMembers, rateLevel)
		);

		const rowSums = rows?.reduce<Record<string, number>>((acc, row) => {
			const sum = columns?.reduce((total, col) => {
				const value = row[col.id] as number;
				return total + value;
			}, 0);

			if (sum !== undefined) {
				acc[row.id] = sum;
			}
			return acc;
		}, {});

		const rowSumDollars = rows?.reduce<Record<string, number>>(
			(acc, row) => {
				const rowSum = columns?.reduce((sum, col, index) => {
					const value = row[col.id] as number;
					const rate = columnRates ? columnRates[index] : 1;
					return sum + value * rate;
				}, 0);

				if (rowSum !== undefined) {
					acc[row.id] = rowSum;
				}
				return acc;
			},
			{}
		);

		// Calculate sums by column
		const columnSums = columns?.reduce<Record<string, number>>(
			(acc, col) => {
				const sum =
					rows?.reduce((total, row) => {
						const value = row[col.id] as number;
						return total + value;
					}, 0) || 0;
				acc[col.id] = sum;
				return acc;
			},
			{}
		);

		const colSumDollars = columns?.reduce<Record<string, number>>(
			(acc, col, colIndex) => {
				const sum = rows?.reduce((total, row) => {
					const value = row[col.id] as number;
					const rate = columnRates ? columnRates[colIndex] : 1;
					return total + value * rate;
				}, 0);

				if (sum !== undefined) {
					acc[col.id] = sum;
				}
				return acc;
			},
			{}
		);

		// SUMPRODUCT VALUES
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
			rowSumDollars: rowSumDollars,
			colSum: columnSums,
			colSumDollars: colSumDollars,
			totalDollars: totalDollars,
			totalHours: totalHours,
		};
	}

	// console.log("rowSum", calculateSums(columns, rows).rowSum);
	// console.log("rowSumDollars:", calculateSums(columns, rows).rowSumDollars);
	// console.log("colSum:", calculateSums(columns, rows).colSum);
	// console.log("colSumDollars:", calculateSums(columns, rows).colSumDollars);
	// console.log("totalDollars:", calculateSums(columns, rows).totalDollars);
	// console.log("totalHours:", calculateSums(columns, rows).totalHours);

	const {
		rateLevel,
		WBSAssignments,
		WBSActivities,
		addTeamMember,
		addActivity,
	} = useMemo(() => {
		return DB_DATA;
	}, []);

	const processTeamMembers = () => {
		// Create a map to track occurrences of each team member
		const memberOccurrences = new Map();

		// Process each team member and handle duplicates
		const processedMembers = teamMembers.map((member) => {
			// Create a count for this member if it doesn't exist
			if (!memberOccurrences.has(member.id)) {
				memberOccurrences.set(member.id, 0);
			}

			// Increment the count
			const currentCount = memberOccurrences.get(member.id);
			memberOccurrences.set(member.id, currentCount + 1);

			// Create the member object, appending _# for duplicates
			const processedMember = {
				...member,
				id:
					currentCount > 0
						? `${member.id}_${currentCount}`
						: member.id,
			};

			return processedMember;
		});

		return processedMembers;
	};

	const balls = processTeamMembers();
	console.log(balls);

	return (
		<>
			<div className="text-white flex flex-col gap-4">
				{/* <p>{JSON.stringify(Object.values(columnSums))}</p>
				<p>{JSON.stringify(Object.values(colSumDollars))}</p>
				<p>{JSON.stringify(Object.values(rowSums))}</p>
				<p>{JSON.stringify(Object.values(rowSumDollars))}</p> */}
				{/* <p>{JSON.stringify(columnSums)}</p>
				<p>{JSON.stringify(Object.values(rowSums))}</p> */}
			</div>
		</>
	);
}
