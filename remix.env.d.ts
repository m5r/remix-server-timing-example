/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

import { Measurer } from "./server-timing-measurer";

declare module "@remix-run/server-runtime" {
	import type { Measurer } from "./server-timing-measurer";

	export interface AppLoadContext {
		measurer: Measurer;
	}
}
