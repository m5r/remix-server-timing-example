const path = require("node:path");
const fs = require("node:fs");
const esbuild = require("esbuild");

const args = process.argv.slice(2);
const watch = args.includes("--watch");
const basePath = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(basePath, "package.json"), "utf8"));
const nodeModules = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]
	.map((key) => (packageJson[key] ? Object.keys(packageJson[key]) : []))
	.flat(1);

(async () => {
	const context = await esbuild.context({
		write: true,
		outfile: path.join(basePath, "server.js"),
		entryPoints: [path.join(basePath, "server.ts")],
		platform: "node",
		format: "cjs",
		bundle: true,
		sourcemap: "inline",
		plugins: [
			{
				name: "node-externals",
				setup(build) {
					// On every module resolved, we check if the module name should be an external
					build.onResolve({ namespace: "file", filter: /.*/ }, (args) => {
						// To allow sub imports from packages we take only the first path to deduct the name
						let moduleName = args.path.split("/")[0];

						// In case of scoped package
						if (args.path.startsWith("@")) {
							const split = args.path.split("/");
							moduleName = `${split[0]}/${split[1]}`;
						}

						// Mark the module as external so it is not resolved
						if (nodeModules.includes(moduleName)) {
							return { path: args.path, external: true };
						}

						return null;
					});
				},
			},
			{
				name: "remix-bundle-external",
				setup(build) {
					build.onResolve({ filter: /^\.\/build$/ }, () => ({ external: true }));
				},
			},
			{
				name: "build-logger",
				setup(build) {
					let count = 0;
					build.onEnd(async (buildResult) => {
						if (buildResult.errors.length) {
							return;
						}

						if (count++ === 0) {
							console.log("Server build succeeded");
						} else {
							console.log("Server rebuilt successfully");
						}
					});
				},
			},
		],
	});

	await context.watch();
	if (!watch) {
		await context.dispose();
	}
})().catch((error) => {
	console.error(error);
	process.exit(1);
});
