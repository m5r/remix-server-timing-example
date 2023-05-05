import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "@remix-run/react";
import { type HandleDocumentRequestFunction, Response } from "@remix-run/node";
import isbot from "isbot";

const ABORT_DELAY = 5000;

const handleRequest: HandleDocumentRequestFunction = async (
	request,
	responseStatusCode,
	responseHeaders,
	remixContext,
	loadContext,
) => {
	const callbackName = isbot(request.headers.get("user-agent")) ? "onAllReady" : "onShellReady";

	return new Promise((resolve, reject) => {
		let didError = false;

		const { pipe, abort } = renderToPipeableStream(<RemixServer context={remixContext} url={request.url} />, {
			[callbackName]() {
				const body = new PassThrough();

				responseHeaders.set("Content-Type", "text/html");
				loadContext.measurer.toHeaders(responseHeaders);

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
};

export default handleRequest;
