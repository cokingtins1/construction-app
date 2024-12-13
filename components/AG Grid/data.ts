export type WBSActivity = {
	// id: string;
	row?: number;
	task: string;
	assumption?: string;
	hours_MGR: number;
	hours_SPTL: number;
	totalDollars?: number;
	totalHours?: number;
};

export const data: WBSActivity[] = [
	{
		task: "Study/Report",
		assumption: "",
		hours_MGR: 0,
		hours_SPTL: 0,
		totalHours: undefined,
		totalDollars: undefined,
	},
	{
		task: "Programming",
		assumption: "",
		hours_MGR: 0,
		hours_SPTL: 0,
		totalHours: undefined,
		totalDollars: undefined,
	},
	{
		task: "Site Visit",
		assumption: "in DD",
		hours_MGR: 0,
		hours_SPTL: 0,
		totalHours: undefined,
		totalDollars: undefined,
	},

	{
		task: "Code Required Building Energy Reports (COMCheck / Title 24, etc.)",
		assumption: "",
		hours_MGR: 0,
		hours_SPTL: 0,
		totalHours: undefined,
		totalDollars: undefined,
	},
	{
		task: "Review Historical Data from Past Projects / Facility Specific Database",
		assumption: "",
		hours_MGR: 0,
		hours_SPTL: 0,
		totalHours: undefined,
		totalDollars: undefined,
	},
	{
		task: "Establish Project Database and Files",
		assumption: "",
		hours_MGR: 0,
		hours_SPTL: 0,
		totalHours: undefined,
		totalDollars: undefined,
	},
	{
		task: "Review Existing Drawings",
		assumption: "",
		hours_MGR: 0,
		hours_SPTL: 0,
		totalHours: undefined,
		totalDollars: undefined,
	},
	{
		task: "Create drawings of existing conditions",
		assumption: "",
		hours_MGR: 0,
		hours_SPTL: 0,
		totalHours: undefined,
		totalDollars: undefined,
	},
	{
		task: "Create Demolition Drawings",
		assumption: "",
		hours_MGR: 5,
		hours_SPTL: 10,
		totalHours: undefined,
		totalDollars: undefined,
	},
	{
		task: "Legend, Abbreviations, General Notes",
		assumption: "",
		hours_MGR: 1,
		hours_SPTL: 0,
		totalHours: undefined,
		totalDollars: undefined,
	},
	{
		task: "GMP Area Classifications and Material Schedule",
		assumption: "",
		hours_MGR: 0,
		hours_SPTL: 2,
		totalHours: undefined,
		totalDollars: undefined,
	},
	{
		task: "Long Lead Equipment List",
		assumption: "",
		hours_MGR: 0,
		hours_SPTL: 0,
		totalHours: undefined,
		totalDollars: undefined,
	},
	{
		task: "Prepare an Energy Model for the Facility",
		assumption: "",
		hours_MGR: 0,
		hours_SPTL: 0,
		totalHours: undefined,
		totalDollars: undefined,
	},
];
