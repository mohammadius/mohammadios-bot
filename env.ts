import * as mod from "https://deno.land/std@0.190.0/dotenv/mod.ts";

const env = await mod.load({ envPath: new URL(".env", import.meta.url).pathname });

export default {
	BOT_TOKEN: env.BOT_TOKEN,
	SPOTIFY_ID: env.SPOTIFY_ID,
	SPOTIFY_SECRET: env.SPOTIFY_SECRET,
	SEQ_KEY: env.SEQ_KEY
};
