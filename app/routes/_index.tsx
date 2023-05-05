import { setTimeout as sleep } from "node:timers/promises";
import { type LoaderArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ context }: LoaderArgs) {
	return context.measurer.time("_index#loader", async () => {
		await sleep(1000);
		return json({ name: "groot" });
	});
}

export default function IndexPage() {
	const { name } = useLoaderData<typeof loader>();
	return <div>hello, {name}!</div>
}
