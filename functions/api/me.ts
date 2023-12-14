import type { PluginData } from "@cloudflare/pages-plugin-cloudflare-access";
import { Env } from "../env";
export const onRequestGet: PagesFunction<Env, string, PluginData> = ({
	data,
}) => {
	return new Response(JSON.stringify(data), {
		headers: {
			"content-type": "application/json",
		},
	});
};
