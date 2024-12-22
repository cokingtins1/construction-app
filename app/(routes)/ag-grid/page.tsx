import DynamicWBS from "@/components/AG Grid/DynamicWBS";
import GenericWBS from "@/components/AG Grid/GenericWBS";
import GridExample from "@/components/AG Grid/GridExample";
import WBSGrid from "@/components/AG Grid/WBSGrid";
import { ActivitiesWithAssignments } from "@/lib/types";
import { rateLevelOrder } from "@/lib/utils";
import prisma from "@/prisma/__base";
import { Prisma, TeamMember, WBSAssignment } from "@prisma/client";

export default async function Page() {
	// const rateLevels = await prisma.rateLevel.findMany();

	// const wbsTemplate = await prisma.wBSTemplate.findFirst();
	// const wbsTemplateId = wbsTemplate?.id;

	// let activitiesWithAssignments: ActivitiesWithAssignments = [];
	// let teamMembers: TeamMember[] = [];

	// const WBSAssignments = await prisma.wBSAssignment.findMany();

	// const wbsActivities = await prisma.wBSActivity.findMany()

	// if (wbsTemplateId) {
	// 	activitiesWithAssignments = await prisma.wBSActivity.findMany({
	// 		where: { wbs_template_id: wbsTemplateId },
	// 		include: {
	// 			WBSAssignment: {
	// 				include: { TeamMember: true },
	// 			},
	// 		},
	// 	});
	// }

	// if (activitiesWithAssignments.length > 0) {
	// 	teamMembers = Array.from(
	// 		new Map(
	// 			activitiesWithAssignments
	// 				.flatMap((activity) => activity.WBSAssignment)
	// 				.map((assignment) => [
	// 					assignment.team_member_id,
	// 					assignment.TeamMember,
	// 				])
	// 		).values()
	// 	).sort((a, b) => {
	// 		const aOrder = rateLevelOrder[a.rate_level_code] ?? 4;
	// 		const bOrder = rateLevelOrder[b.rate_level_code] ?? 4;
	// 		return aOrder - bOrder;
	// 	});
	// }

	// console.log(
	// 	"WBSActivities:",
	// 	wbsActivities,
	// 	"WBSAssignments:",
	// 	WBSAssignments,
	// 	"teamMembers:",
	// 	teamMembers
	// );

	return (
		<>
			<div className="flex flex-col gap-4">
				<div className="flex justify-center h-[500px] w-full">
					{/* <DynamicWBS /> */}
					<GenericWBS />
				</div>
				<div className="flex justify-center h-[500px] w-full"></div>
			</div>
		</>
	);
}
