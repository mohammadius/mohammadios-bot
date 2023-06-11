import * as mod from "https://deno.land/std@0.190.0/dotenv/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const envZod = z.object({
	BOT_TOKEN: z.string(),
	SPOTIFY_ID: z.string(),
	SPOTIFY_SECRET: z.string(),
	SEQ_KEY: z.string()
});

const env = await mod.load({ envPath: new URL(".env", import.meta.url).pathname });

export default envZod.parse({
	BOT_TOKEN: env.BOT_TOKEN,
	SPOTIFY_ID: env.SPOTIFY_ID,
	SPOTIFY_SECRET: env.SPOTIFY_SECRET,
	SEQ_KEY: env.SEQ_KEY
});
