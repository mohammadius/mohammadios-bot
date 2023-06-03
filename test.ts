import { assertExists, assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import env from "./env.ts";
import { notEmpty } from "./utility.ts";

Deno.test("env", () => {
	assertExists(env.BOT_TOKEN);
	assertExists(env.SEQ_KEY);
	assertExists(env.SPOTIFY_ID);
	assertExists(env.SPOTIFY_SECRET);
});

Deno.test("notEmpty", () => {
	const filtered = ["one", null, "two", undefined].filter(notEmpty);
	assertEquals(filtered[0], "one");
	assertEquals(filtered[1], "two");
	assertEquals(filtered.length, 2);
});
