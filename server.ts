import path from "node:path";
import express from "express";
import compression from "compression";
import morgan from "morgan";

import { createRequestHandler } from "./remix-express";
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

		return createRequestHandler({
			build: require("./build"),
			mode: process.env.NODE_ENV,
			getLoadContext() {
				return { measurer: new Measurer() };
			},
		})(req, res, next);
	},
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
	require("./build"); // preload the build so we're ready for the first request
	console.info(`Server listening on port ${port}`);
});

const buildDir = path.join(process.cwd(), "build");
function purgeRequireCache() {
	for (const key in require.cache) {
		if (key.startsWith(buildDir)) {
			delete require.cache[key];
		}
	}
}
