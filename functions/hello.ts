import { Env } from "./env.js";

export const onRequest: PagesFunction<Env> = async ({ env }) => {
	env.NORTHWIND_DB.query("SELECT * FROM Customers");
	return new Response("Hello!");
};
