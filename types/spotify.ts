import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

export const spotifyMusicInfoZod = z.object({
	name: z.string(),
	trackNumber: z.number().int().nonnegative(),
	duration: z.number().int().nonnegative(),
	artists: z.array(z.string()).nonempty(),
	albumName: z.string(),
	albumReleaseYear: z.string(),
	albumArtists: z.array(z.string()).nonempty(),
	albumImage: z.string().url(),
	totalTracks: z.number().int().nonnegative()
});

export const spotifyMusicInfoArrayZod = z.array(spotifyMusicInfoZod);

export type SpotifyMusicInfo = z.infer<typeof spotifyMusicInfoZod>;
export type SpotifyMusicInfoArray = z.infer<typeof spotifyMusicInfoArrayZod>;
