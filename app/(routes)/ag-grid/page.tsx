import DynamicWBS from '@/components/AG Grid/DynamicWBS';
import GridExample from "@/components/AG Grid/GridExample";
import WBSGrid from "@/components/AG Grid/WBSGrid";
import { prisma } from '@/prisma/__base';

export default async function Page() {

	const teamMembers = await prisma.teamMember.findMany()
	const rateLevels = await prisma.rateLevel.findMany()

	return (
		<div className="h-5/6">
			<DynamicWBS teamData={teamMembers} rateLevels={rateLevels}/>
		</div>
	);
}
