import { Client } from "https://deno.land/x/postgres/mod.ts";

const client = new Client({
	user: "user",
	database: "test",
	hostname: "localhost",
	port: 5432
});

await client.connect();

console.log(client);
