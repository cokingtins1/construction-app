import prisma from "@/prisma/__base";
import {
	Client,
	Project,
	RateLevel,
	TeamMember,
	WBSActivity,
	WBSAssignment,
} from "@prisma/client";

export default async function seed() {
	function createEmail(firstName: string, lastName: string) {
		return `${firstName.charAt(0)}${lastName}@testCo.com`;
	}

	function randomNumber(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	async function createRatesAndTeams() {
		const rateLevels: RateLevel[] = [
			{
				id: crypto.randomUUID(),
				level_name: "Manager",
				code: "MGR",
				rate: 215,
			},
			{
				id: crypto.randomUUID(),
				level_name: "Senior Project Team Lead",
				code: "SPTL",
				rate: 200,
			},
			{
				id: crypto.randomUUID(),
				level_name: "Project Team Leader",
				code: "PTL",
				rate: 165,
			},
			{
				id: crypto.randomUUID(),
				level_name: "Project Staff",
				code: "PS",
				rate: 125,
			},
			{
				id: crypto.randomUUID(),
				level_name: "Co-Op",
				code: "COOP",
				rate: 70,
			},
		];

		// Create Team Members
		const teamMembers: TeamMember[] = [
			{
				id: "6e7b12ba-a897-e7d8-cb7a-5c4d251be342",
				first_name: "Dennis",
				last_name: "Spitznagel",
				middle_name: "A",
				email: "dspitznagel@test.com",
				department: "HVAC",
				rate_level_code: "MGR",
				title: "Department Manager",
			},
			{
				id: "86734044-2506-0262-10c7-d9e3b3023f4c",
				first_name: "Chris",
				last_name: "Schaffer",
				middle_name: "L",
				email: "cschaffer@test.com",
				department: "HVAC",
				rate_level_code: "SPTL",
				title: "Senior Project Team Lead",
			},
			{
				id: "eb378bf7-8722-e411-e74c-9f34941ffc37",
				first_name: "David",
				last_name: "Klenk",
				middle_name: "L",
				email: "dklenk@test.com",
				department: "HVAC",
				rate_level_code: "SPTL",
				title: "Senior Project Team Lead",
			},
			{
				id: "232ab19b-9b76-6c77-b62e-6735178a9c7c",
				first_name: "Alex",
				last_name: "Lee",
				middle_name: "",
				email: "alee@test.com",
				department: "HVAC",
				rate_level_code: "PTL",
				title: "Project Team Leader",
			},
			{
				id: "f3f907a8-8489-4324-da0f-4a2b9d90c15e",
				first_name: "Olivia",
				last_name: "Woodds",
				middle_name: "K",
				email: "owoodds@test.com",
				department: "HVAC",
				rate_level_code: "COOP",
				title: "Co-Op",
			},
		];

		await prisma.rateLevel.createMany({ data: rateLevels });
		await prisma.teamMember.createMany({ data: teamMembers });
	}
	async function createTemplate() {
		await prisma.wBSTemplate.create({
			data: {
				id: crypto.randomUUID(),
				project_phase: "Phase 1",
				department: "HVAC",
				total_dollars: 0,
				total_hours: 0,
				is_template: true,
			},
		});
	}

	const teamMembersDB = await prisma.teamMember.findMany();
	const rates = await prisma.rateLevel.findMany();

	const wbsTemplate = await prisma.wBSTemplate.findFirst();

	async function createTasks() {
		const tasks = ["Task 1", "Task 2", "Task 3", "Task 4"];
		const wbsActivities: WBSActivity[] = [];
		for (const task of tasks) {
			if (!wbsTemplate) return;

			wbsActivities.push({
				id: crypto.randomUUID(),
				wbs_template_id: wbsTemplate.id,
				task,
				notes: `Notes for ${task}`,
				total_dollars: 0,
				total_hours: 0,
			});
		}

		await prisma.wBSActivity.createMany({ data: wbsActivities });
	}

	async function creatAssignments() {
		const wbsAssignments: WBSAssignment[] = [];
		const wbsActivities = await prisma.wBSActivity.findMany();
		for (const activity of wbsActivities) {
			for (const teamMember of teamMembersDB) {
				const rate = rates.find(
					(rateLevel) => rateLevel.code === teamMember.rate_level_code
				)?.rate;

				const random = Math.random() < 0.5;

				if (!rate || !wbsActivities) continue;

				if (random) {
					const hours = randomNumber(2, 40);

					wbsAssignments.push({
						id: crypto.randomUUID(),
						wbs_activity_id: activity.id,
						team_member_id: teamMember.id,
						hours: hours,
						rate: rate,
						total_dollars: rate * hours,
						total_hours: hours,
					});
				}
			}
		}
		await prisma.wBSAssignment.createMany({ data: wbsAssignments });
	}

	// await creatAssignments();
	// await createTasks();
}
