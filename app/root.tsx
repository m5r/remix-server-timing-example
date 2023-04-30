import { type FunctionComponent, type PropsWithChildren, useEffect } from "react";
import type { ErrorResponse } from "@remix-run/router";
import { type LoaderArgs, json } from "@remix-run/node";
import {
	isRouteErrorResponse,
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useRouteError,
} from "@remix-run/react";

export async function loader({ request }: LoaderArgs) {
	return json(
		{},
		{
			headers: {},
		},
	);
}

export default function App() {
	return (
		<Document>
			<Outlet />
		</Document>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	console.error(error);

	if (isRouteErrorResponse(error)) {
		return <CatchBoundary caught={error} />;
	}

	return (
		<Document>
			<div>
				<h1>There was an error</h1>
				{error instanceof Error && <p>{error.message}</p>}
			</div>
		</Document>
	);
}

function CatchBoundary({ caught }: { caught: ErrorResponse }) {
	let message;
	switch (caught.status) {
		case 401:
			message = <p>Oops! Looks like you tried to visit a page that you do not have access to.</p>;
			break;
		case 404:
			message = <p>Oops! Looks like you tried to visit a page that does not exist.</p>;
			break;
		default:
			throw new Error(caught.data || caught.statusText);
	}

	return (
		<Document>
			<main>
				<h1>
					{caught.status}: {caught.statusText}
				</h1>
				{message}
			</main>
		</Document>
	);
}

const Document: FunctionComponent<PropsWithChildren<unknown>> = ({ children }) => (
	<html lang="en">
		<head>
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width,initial-scale=1" />
			<Meta />
			<Links />
		</head>
		<body>
			{children}
			<ScrollRestoration />
			<Scripts />
			<LiveReload />
		</body>
	</html>
);
