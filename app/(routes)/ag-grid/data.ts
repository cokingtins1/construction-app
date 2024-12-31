import {
	RateLevel,
	TeamMember,
	WBSActivity,
	WBSAssignment,
} from "@prisma/client";

export const WBSActivities: WBSActivity[] = [
	{
		id: "0248fefa-5683-4657-b8cc-ba8c03415857",
		task: "Task 1",
		notes: "Notes for Task 1",
		total_dollars: 0,
		total_hours: 0,
		wbs_template_id: "cc84b70d-f83f-4458-b799-d82a9f9cad55",
	},
	{
		id: "caa7acd5-2874-49d6-afd8-d9a99e82c907",
		task: "Task 2",
		notes: "Notes for Task 2",
		total_dollars: 0,
		total_hours: 0,
		wbs_template_id: "cc84b70d-f83f-4458-b799-d82a9f9cad55",
	},
	{
		id: "e4235cc1-747c-4ad5-8380-52ce8b5c0b79",
		task: "Task 3",
		notes: "Notes for Task 3",
		total_dollars: 0,
		total_hours: 0,
		wbs_template_id: "cc84b70d-f83f-4458-b799-d82a9f9cad55",
	},
	{
		id: "aae495ae-7a68-4537-8a21-0af6a2449fef",
		task: "Task 4",
		notes: "Notes for Task 4",
		total_dollars: 0,
		total_hours: 0,
		wbs_template_id: "cc84b70d-f83f-4458-b799-d82a9f9cad55",
	},
];

export const WBSAssignments: WBSAssignment[] = [
	{
		id: "77fd97e8-05bb-47da-8348-ea7e73322c27",
		wbs_activity_id: "0248fefa-5683-4657-b8cc-ba8c03415857",
		team_member_id: "86734044-2506-0262-10c7-d9e3b3023f4c",
		hours: 30,
		rate: 200,
		total_dollars: 6000,
		total_hours: 30,
	},
	{
		id: "8dc1fa47-bd61-4bdb-b33a-a0a9dfbe3706",
		wbs_activity_id: "caa7acd5-2874-49d6-afd8-d9a99e82c907",
		team_member_id: "6e7b12ba-a897-e7d8-cb7a-5c4d251be342",
		hours: 30,
		rate: 215,
		total_dollars: 6450,
		total_hours: 30,
	},
	{
		id: "d835b191-90a4-4c48-9e4f-2ea784e65eac",
		wbs_activity_id: "caa7acd5-2874-49d6-afd8-d9a99e82c907",
		team_member_id: "eb378bf7-8722-e411-e74c-9f34941ffc37",
		hours: 13,
		rate: 200,
		total_dollars: 2600,
		total_hours: 13,
	},
	{
		id: "b0af1d46-d03f-4bdf-a7d1-0e1131479bb5",
		wbs_activity_id: "caa7acd5-2874-49d6-afd8-d9a99e82c907",
		team_member_id: "232ab19b-9b76-6c77-b62e-6735178a9c7c",
		hours: 24,
		rate: 165,
		total_dollars: 3960,
		total_hours: 24,
	},
	{
		id: "33aeac4b-22e6-4e33-89ab-88363aff9e43",
		wbs_activity_id: "e4235cc1-747c-4ad5-8380-52ce8b5c0b79",
		team_member_id: "6e7b12ba-a897-e7d8-cb7a-5c4d251be342",
		hours: 8,
		rate: 215,
		total_dollars: 1720,
		total_hours: 8,
	},
	{
		id: "487527bf-083d-4961-8c09-ffa716d8ba6a",
		wbs_activity_id: "e4235cc1-747c-4ad5-8380-52ce8b5c0b79",
		team_member_id: "86734044-2506-0262-10c7-d9e3b3023f4c",
		hours: 11,
		rate: 200,
		total_dollars: 2200,
		total_hours: 11,
	},
	{
		id: "b8a4474c-8f76-474b-85ed-0b2f1d06b5b9",
		wbs_activity_id: "e4235cc1-747c-4ad5-8380-52ce8b5c0b79",
		team_member_id: "eb378bf7-8722-e411-e74c-9f34941ffc37",
		hours: 30,
		rate: 200,
		total_dollars: 6000,
		total_hours: 30,
	},

	{
		id: "c62d5ba0-dfa9-4456-b776-b0d98109dc6b",
		wbs_activity_id: "e4235cc1-747c-4ad5-8380-52ce8b5c0b79",
		team_member_id: "232ab19b-9b76-6c77-b62e-6735178a9c7c",
		hours: 15,
		rate: 165,
		total_dollars: 1050,
		total_hours: 15,
	},
	{
		id: "d170f290-4fdf-467b-8a3a-48245b6f32ed",
		wbs_activity_id: "aae495ae-7a68-4537-8a21-0af6a2449fef",
		team_member_id: "86734044-2506-0262-10c7-d9e3b3023f4c",
		hours: 20,
		rate: 200,
		total_dollars: 4000,
		total_hours: 20,
	},

	{
		id: "27f651eb-158a-4124-aa7a-4a6450bd6f3b",
		wbs_activity_id: "aae495ae-7a68-4537-8a21-0af6a2449fef",
		team_member_id: "232ab19b-9b76-6c77-b62e-6735178a9c7c",
		hours: 401,
		rate: 165,
		total_dollars: 2970,
		total_hours: 18,
	},
	//duplicate Lee
	{
		id: "8b2d311f-9ace-8723-10da-bf8a2f08288c",
		wbs_activity_id: "aae495ae-7a68-4537-8a21-0af6a2449fef",
		team_member_id: "232ab19b-9b76-6c77-b62e-6735178a9c7c",
		hours: 400,
		rate: 165,
		total_dollars: 2450,
		total_hours: 35,
	},
	{
		id: "8b2d311f-9ace-8723-10da-bf8a2f08288c",
		wbs_activity_id: "e4235cc1-747c-4ad5-8380-52ce8b5c0b79",
		team_member_id: "232ab19b-9b76-6c77-b62e-6735178a9c7c",
		hours: 88,
		rate: 165,
		total_dollars: 2450,
		total_hours: 35,
	},
	//Woods:
	{
		id: "6b490c68-37b6-478a-8558-e5bef54451bf",
		wbs_activity_id: "aae495ae-7a68-4537-8a21-0af6a2449fef",
		team_member_id: "f3f907a8-8489-4324-da0f-4a2b9d90c15e",
		hours: 1,
		rate: 70,
		total_dollars: 2450,
		total_hours: 35,
	},
];

export const teamMembers: TeamMember[] = [
	{
		id: "6e7b12ba-a897-e7d8-cb7a-5c4d251be342",
		first_name: "Dennis",
		last_name: "Spitznagel",
		middle_name: "A",
		email: "dspitznagel@test.com",
		department: "HVAC",
		title: "Department Manager",
		rate_level_code: "MGR",
	},
	{
		id: "86734044-2506-0262-10c7-d9e3b3023f4c",
		first_name: "Chris",
		last_name: "Schaffer",
		middle_name: "L",
		email: "cschaffer@test.com",
		department: "HVAC",
		title: "Senior Project Team Lead",
		rate_level_code: "SPTL",
	},
	{
		id: "eb378bf7-8722-e411-e74c-9f34941ffc37",
		first_name: "David",
		last_name: "Klenk",
		middle_name: "L",
		email: "dklenk@test.com",
		department: "HVAC",
		title: "Senior Project Team Lead",
		rate_level_code: "SPTL",
	},
	{
		id: "232ab19b-9b76-6c77-b62e-6735178a9c7c",
		first_name: "Alex",
		last_name: "Lee",
		middle_name: "",
		email: "alee@test.com",
		department: "HVAC",
		title: "Project Team Leader",
		rate_level_code: "PTL",
	},
	{
		id: "232ab19b-9b76-6c77-b62e-6735178a9c7c",
		first_name: "Alex",
		last_name: "Lee",
		middle_name: "",
		email: "alee@test.com",
		department: "HVAC",
		title: "Project Team Leader",
		rate_level_code: "PTL",
	},
	{
		id: "f3f907a8-8489-4324-da0f-4a2b9d90c15e",
		first_name: "Olivia",
		last_name: "Woods",
		middle_name: "K",
		email: "owoodds@test.com",
		department: "HVAC",
		title: "Co-Op",
		rate_level_code: "COOP",
	},
];

const addTeamMember: TeamMember[] = [
	{
		id: "02398fbf-61f6-65b8-4da8-fa2ad170cddc",
		first_name: "Charlie",
		last_name: "Lackmeyer",
		middle_name: "D",
		email: "clackmeyer@test.com",
		department: "HVAC",
		title: "Project Team Lead",
		rate_level_code: "PTL",
	},
];

export const addActivity: WBSActivity[] = [
	{
		id: "c651ac21-b74c-225f-ef11-fdf2eb9e2eb8",
		task: "Task 5",
		notes: "Notes for Task 5",
		total_dollars: 0,
		total_hours: 0,
		wbs_template_id: "cc84b70d-f83f-4458-b799-d82a9f9cad55",
	},
];

export const rateLevel: RateLevel[] = [
	{
		id: "bc6bb6b3-0965-44ff-ba39-6b1dd8b8bfc2",
		level_name: "Manager",
		code: "MGR",
		rate: 215,
	},
	{
		id: "8d3051da-6fd4-4558-bd47-7ac4e0e6aa3b",
		level_name: "Senior Project Team Lead",
		code: "SPTL",
		rate: 200,
	},
	{
		id: "be8f2405-9b89-4f98-8323-ffa65a79a357",
		level_name: "Project Team Leader",
		code: "PTL",
		rate: 165,
	},
	{
		id: "a3ecc025-112f-4842-ace6-95104a780bbc",
		level_name: "Project Staff",
		code: "PS",
		rate: 125,
	},
	{
		id: "5dfd8377-bc52-4036-ba8e-5bccbcce58d5",
		level_name: "Co-Op",
		code: "COOP",
		rate: 70,
	},
];

export const DB_DATA = {
	teamMembers,
	rateLevel,
	WBSAssignments,
	WBSActivities,
	addTeamMember,
	addActivity,
};

// In the part of my code where I'm changing a team member from one to the other, the functionality is faulty. Currently, the field of each column is set to each team member's id. The colId of each column will match the field value. If there are two columns with the same id i.e. the same team member is in two different columns, AG grid will append a "_1" to the colId of the duplicate team member. If there is a third instance of the same team member, a "_2" will be appended to the colId and so on. This functionality is good and is expected. However, when I change from one team member to another, the row values of the column that is now being duplicated gets copied over into the changed column's rows. Moreover, when the row data is changed for the changed column, the data also changes in the duplicated column. How can you fix my code so that when I change from on team member to another, only the colId and field update and the rows stay independent from any duplicate team member column?
