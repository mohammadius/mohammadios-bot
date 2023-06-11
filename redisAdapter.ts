import type { StorageAdapter } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import type { Redis } from "https://deno.land/x/redis@v0.30.0/mod.ts";
import redis from "./redis.ts";
import { type SessionData, sessionDataZod } from "./types/bot.ts";
import { initialSession } from "./botHelpers.ts";

export class RedisAdapter implements StorageAdapter<SessionData> {
	private redis: Redis;

	constructor() {
		this.redis = redis;
	}

	async read(key: string) {
		const session = await this.redis.get(key);
		const result = sessionDataZod.safeParse(JSON.parse(session ?? "0"));
		if (result.success) {
			return result.data;
		}
	}

	async write(key: string, value: SessionData) {
		const result = sessionDataZod.safeParse(value);
		JSON.stringify(result.success ? result.data : initialSession());
		await this.redis.set(key, JSON.stringify(result.success ? result.data : initialSession()));
	}

	async delete(key: string) {
		await this.redis.del(key);
	}
}
