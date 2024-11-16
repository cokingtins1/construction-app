import PromptForm from "@/components/custom/PromptForm";
import { Button } from "@/components/ui/newbutton";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { createClient } from "@libsql/client";
import updateDB from "./actions/updateDB";
import { prisma } from "@/prisma/_base";

export default function Home() {
	const embeddings = new HuggingFaceInferenceEmbeddings({
		model: "text-embedding-3-small",
	});

	// Local instantiation
	const libsqlClient = createClient({
		url: "file:./dev.db",
	});

	return (
		<div className="flex flex-col items-center w-full">
			<PromptForm />

			<div className="flex items-center gap-4">
				<p>Test DB</p>
				<form
					action={async () => {
						"use server";
						const id = "01124963-ca79-4ff5-90eb-2882783075b5";
						// await updateDB();
						const balls = await prisma.vectorStore.findMany({
							select: { id: true },
						});

						console.log(balls);

						// const res = await prisma.prismaLangChain.findMany({
						// 	select: { id: true, chunkId: true, metadata: true },
						// });

						// console.dir(
						// 	res.map((item) => item.chunkId),
						// 	{ maxArrayLength: null }
						// );
					}}
				>
					<Button>Delete Data</Button>
				</form>
			</div>
		</div>
	);
}
