import type { Context, SessionFlavor } from "grammy";
import { SpotifyMusicInfo } from "./spotify";

// Define the shape of our session.
export interface SessionData {
	spotifyMusics: SpotifyMusicInfo[];
	selectedSpotifyMusic: number | null;
	youtubeVideos: string[];
}

// Flavor the context type to include sessions.
export type MyContext = Context & SessionFlavor<SessionData>;
