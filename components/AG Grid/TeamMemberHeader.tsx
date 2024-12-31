import { TeamMember } from "@prisma/client";
import React, { useCallback, useEffect, useState } from "react";
import { TeamMemberComboBox } from "./TeamMemberComboBox";
import { baseId } from "@/lib/utils";

type TeamMemberHeaderProps = {
	teamMembers: TeamMember[];
	currentMemberId: string;
	onTeamMemberChange: (oldMemberId: string, newMemberId: string) => void;
};
export default function TeamMemberHeader(props: TeamMemberHeaderProps) {
	const { teamMembers, currentMemberId, onTeamMemberChange } = props;

	const findTeamMember = (id: string) => {
		return teamMembers.find((m) => m.id === baseId(id));
	};

	const [currentMember, setCurrentMember] = useState(() =>
		findTeamMember(currentMemberId)
	);

	useEffect(() => {
		setCurrentMember(findTeamMember(currentMemberId));
	}, [currentMemberId]);

	return (
		<>
			{currentMember ? (
				<TeamMemberComboBox
					teamMembers={teamMembers}
					currentMemberId={currentMemberId}
					onValueChange={(newId) => {
						onTeamMemberChange(currentMemberId, newId);
						setCurrentMember(() => findTeamMember(newId));
					}}
				/>
			) : (
				<p>N/A</p>
			)}
		</>
	);
}
