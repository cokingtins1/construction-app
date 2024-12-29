import { TeamMember } from "@prisma/client";
import React, { useCallback, useState } from "react";
import { TeamMemberComboBox } from "./TeamMemberComboBox";
import { Underline } from "lucide-react";

type TeamMemberHeaderProps = {
	teamMembers: TeamMember[];
	currentMemberId: string;
	onTeamMemberChange: (oldMemberId: string, newMemberId: string) => void;
};
export default function TeamMemberHeader(props: TeamMemberHeaderProps) {
	const { teamMembers, currentMemberId, onTeamMemberChange } = props;

	const [currentMember, setCurrentMember] = useState(
		teamMembers?.find((m) => m.id === currentMemberId)
	);

	return (
		<>
			{currentMember ? (
				<TeamMemberComboBox
					teamMembers={teamMembers}
					currentMemberId={currentMemberId}
					onValueChange={(newId) => {
						onTeamMemberChange(currentMember.id, newId);
						setCurrentMember(
							teamMembers.find((m) => m.id === newId)
						);
					}}
				/>
			) : (
				<p>N/A</p>
			)}
		</>
	);
}
