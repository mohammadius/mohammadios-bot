import type { Context, SessionFlavor } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import { spotifyMusicInfoArrayZod } from "./spotify.ts";

export const sessionDataZod = z.object({
	state: z.enum(["idle", "searchCommand", "spotifySongSelect", "youtubeSongSelect"]),
	spotifyMusics: spotifyMusicInfoArrayZod,
	selectedSpotifyMusic: z.nullable(z.number().int().nonnegative().max(4)),
	youtubeVideos: z.array(z.string().url())
});

export type SessionData = z.infer<typeof sessionDataZod>;

export type MyContext = Context & SessionFlavor<SessionData>;
