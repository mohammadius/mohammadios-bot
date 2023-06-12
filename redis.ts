import { connect } from "https://deno.land/x/redis@v0.30.0/mod.ts";
import env from "./env.ts";

const redis = await connect({
	hostname: "127.0.0.1",
	port: 6379,
	password: env.REDIS_PASS
});

export default redis;
