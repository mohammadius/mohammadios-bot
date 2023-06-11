import type { StorageAdapter } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import type { Redis } from "https://deno.land/x/redis@v0.30.0/mod.ts";
import redis from "./redis.ts";

export class RedisAdapter<T> implements StorageAdapter<T> {
	private redis: Redis;

	constructor() {
		this.redis = redis;
	}

	async read(key: string) {
		const session = await this.redis.get(key);
		if (session === null || session === undefined) {
			return undefined;
		}
		return JSON.parse(session) as T;
	}

	async write(key: string, value: T) {
		await this.redis.set(key, JSON.stringify(value));
	}

	async delete(key: string) {
		await this.redis.del(key);
	}
}
