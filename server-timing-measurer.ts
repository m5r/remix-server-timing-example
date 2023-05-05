import { performance } from "node:perf_hooks";

type Measure = {
	name: string;
	duration: number;
};

export class Measurer {
	#measures = new Set<Measure>();

	public async time<Result>(name: string, fn: () => Promise<Result>): Promise<Result> {
		console.log("time");
		const start = performance.now();
		try {
			return await fn();
		} finally {
			const duration = performance.now() - start;
			this.#measures.add({ name, duration });
		}
	}

	public toHeaders(headers = new Headers()) {
		console.log("this.#measures", this.#measures);
		for (const { name, duration } of this.#measures) {
			headers.append("Server-Timing", `${name};dur=${duration}`);
		}
		return headers;
	}
}
