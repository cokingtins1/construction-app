import { TeamMember } from "@prisma/client";
import React, { RefObject, useCallback, useEffect, useState } from "react";
import { TeamMemberComboBox } from "./TeamMemberComboBox";
import { baseId } from "@/lib/utils";
import { AgGridReact } from "ag-grid-react";

type TeamMemberHeaderProps = {
	teamMembers: TeamMember[];
	currentMemberId: string;
	gridRef: RefObject<AgGridReact<any>>;
	onTeamMemberChange: (
		oldMemberId: string,
		newMemberId: string,
		rowData: any[]
	) => void;
};
export default function TeamMemberHeader(props: TeamMemberHeaderProps) {
	const { teamMembers, currentMemberId, onTeamMemberChange, gridRef } = props;

	const findTeamMember = (id: string) => {
		return teamMembers.find((m) => m.id === baseId(id));
	};

	const [currentMember, setCurrentMember] = useState(() =>
		findTeamMember(currentMemberId)
	);

	useEffect(() => {
		setCurrentMember(findTeamMember(currentMemberId));
	}, [currentMemberId]);

	function getAllRows() {
		let rowData: any[] = [];
		gridRef.current?.api.forEachNode((node) => rowData.push(node.data));
		return rowData;
	}

	return (
		<>
			{currentMember ? (
				<TeamMemberComboBox
					teamMembers={teamMembers}
					currentMemberId={currentMemberId}
					onValueChange={(newId) => {
						const allRows = getAllRows();
						onTeamMemberChange(currentMemberId, newId, allRows);
						setCurrentMember(() => findTeamMember(newId));
					}}
				/>
			) : (
				<p>N/A</p>
			)}
		</>
	);
}
