import path from "node:path";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { broadcastDevReady } from "@remix-run/node";
import { createRequestHandler } from "@remix-run/express";

import { Measurer } from "./server-timing-measurer";

const app = express();

app.disable("x-powered-by");
app.use(compression());

// cache static and immutable assets
app.use(express.static("public", { immutable: true, maxAge: "1y" }));

app.use(morgan("tiny"));

app.all(
	"*",
	(req, res, next) => {
		if (process.env.NODE_ENV !== "production") {
			purgeRequireCache();
		}

		const build = require("./build");
		if (process.env.NODE_ENV === "development") {
			broadcastDevReady(build);
		}

		return createRequestHandler({
			build,
			mode: process.env.NODE_ENV,
			getLoadContext() {
				return { measurer: new Measurer() };
			},
		})(req, res, next);
	},
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	const build = require("./build"); // preload the build so we're ready for the first request
	console.info(`Server listening on port ${port}`);

	if (process.env.NODE_ENV === "development") {
		broadcastDevReady(build);
	}
});

const buildDir = path.join(process.cwd(), "build");
function purgeRequireCache() {
	for (const key in require.cache) {
		if (key.startsWith(buildDir)) {
			delete require.cache[key];
		}
	}
}
