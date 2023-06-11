import { connect } from "https://deno.land/x/redis@v0.30.0/mod.ts";

const redis = await connect({
	hostname: "127.0.0.1",
	port: 6379
});

export default redis;
