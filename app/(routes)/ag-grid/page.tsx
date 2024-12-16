import DynamicWBS from "@/components/AG Grid/DynamicWBS";
import GridExample from "@/components/AG Grid/GridExample";
import WBSGrid from "@/components/AG Grid/WBSGrid";
import { ActivitiesWithAssignments } from "@/lib/types";
import prisma from "@/prisma/__base";
import { Prisma, TeamMember, WBSAssignment } from "@prisma/client";

export default async function Page() {
	const rateLevels = await prisma.rateLevel.findMany();

	const wbsTemplate = await prisma.wBSTemplate.findFirst();
	const wbsTemplateId = wbsTemplate?.id;

	let activitiesWithAssignments: ActivitiesWithAssignments = [];
	let teamMembers: TeamMember[] = [];

	if (wbsTemplateId) {
		activitiesWithAssignments = await prisma.wBSActivity.findMany({
			where: { wbs_template_id: wbsTemplateId },
			include: {
				WBSAssignment: {
					include: { TeamMember: true },
				},
			},
		});
	}

	return (
		<div className="flex flex-col h-full">
			<div className="flex justify-center">
				{activitiesWithAssignments.length > 0 && (
					<DynamicWBS data={activitiesWithAssignments} />
				)}
			</div>
			<div className="flex justify-center">
				<WBSGrid />
			</div>
		</div>
	);
}
