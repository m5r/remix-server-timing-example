import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "@remix-run/react";
import { type EntryContext, type DataFunctionArgs, type Headers, Response } from "@remix-run/node";
import isbot from "isbot";

const ABORT_DELAY = 5000;

export default async function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
) {
	const callbackName = isbot(request.headers.get("user-agent")) ? "onAllReady" : "onShellReady";

	return new Promise((resolve, reject) => {
		let didError = false;

		const { pipe, abort } = renderToPipeableStream(<RemixServer context={remixContext} url={request.url} />, {
			[callbackName]() {
				const body = new PassThrough();

				responseHeaders.set("Content-Type", "text/html");

				resolve(
					new Response(body, {
						status: didError ? 500 : responseStatusCode,
						headers: responseHeaders,
					}),
				);
				pipe(body);
			},
			onShellError(error: unknown) {
				reject(error);
			},
			onError(error: unknown) {
				didError = true;
				console.error(error);
			},
		});
		setTimeout(abort, ABORT_DELAY);
	});
}

export async function handleDataRequest(response: Response, { request }: DataFunctionArgs) {
	// maybe todo

	return response;
}
