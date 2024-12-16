import seed from "@/app/actions/seed";
import { Button } from "@/components/ui/button";

export default function Page() {
	return (
		<div className="flex flex-col items-center w-full">
			<div className="flex items-center gap-4">
				<p>Test DB</p>
				<form
					action={async () => {
						"use server";

						await seed();
					}}
				>
					<Button>Seed DB</Button>
				</form>
			</div>
		</div>
	);
}
