/**
 * @type {import("@remix-run/dev").AppConfig}
 */
module.exports = {
	// ignore all files in routes folder to prevent
	// default remix convention from picking up routes
	ignoredRouteFiles: ["**/*"],
	future: {
		unstable_dev: {
			port: 8002,
		},
		v2_errorBoundary: true,
		v2_meta: true,
		v2_routeConvention: true,
	},
};
