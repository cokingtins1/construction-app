"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { baseId, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { TeamMember } from "@prisma/client";

type TeamMemberComboBoxProps = {
	teamMembers: TeamMember[];
	currentMemberId: string;
	onValueChange?: (memberId: string) => void;
};

export function TeamMemberComboBox(props: TeamMemberComboBoxProps) {
	const { teamMembers, currentMemberId, onValueChange } = props;

	const uniqueTeamMembers = teamMembers.filter(
		(item, index, self) =>
			index === self.findIndex((m) => baseId(m.id) === baseId(item.id))
	);

	const [open, setOpen] = React.useState(false);
	// const [value, setValue] = React.useState(currentMemberId);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className="w-full justify-between truncate"
				>
					{uniqueTeamMembers.find(
						(mem) => baseId(mem.id) === baseId(currentMemberId)
					)?.last_name || "Select team member..."}
					<ChevronsUpDown className="opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0">
				<Command>
					<CommandInput
						placeholder="Select team member..."
						className="h-9"
					/>
					<CommandList>
						<CommandEmpty>No team members found</CommandEmpty>
						<CommandGroup>
							{uniqueTeamMembers.map((mem) => (
								<CommandItem
									key={mem.id}
									value={mem.last_name}
									onSelect={() => {
										// setValue(mem.id);
										onValueChange?.(mem.id);
										setOpen(false);
									}}
								>
									{mem.last_name}
									<Check
										className={cn(
											"ml-auto",
											baseId(currentMemberId) ===
												baseId(mem.id)
												? "opacity-100"
												: "opacity-0"
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
