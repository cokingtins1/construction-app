import { Prisma } from "@prisma/client";

export type ActivitiesWithAssignments = Prisma.WBSActivityGetPayload<{
	include: {
		WBSAssignment: {
			include: {
				TeamMember: true;
			};
		};
	};
}>[];
