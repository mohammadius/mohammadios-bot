import { type Context, type SessionFlavor } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { SpotifyMusicInfo } from "./spotify.ts";

// Define the shape of our session.
export interface SessionData {
	spotifyMusics: SpotifyMusicInfo[];
	selectedSpotifyMusic: number | null;
	youtubeVideos: string[];
}

// Flavor the context type to include sessions.
export type MyContext = Context & SessionFlavor<SessionData>;

export const initialSession: () => SessionData = () => ({
	spotifyMusics: [],
	selectedSpotifyMusic: null,
	youtubeVideos: []
});
