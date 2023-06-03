import { type Context, type SessionFlavor } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { Keyboard } from "https://deno.land/x/grammy@v1.16.1/convenience/keyboard.ts";
import { SpotifyMusicInfo } from "./spotify.ts";

// Define the shape of our session.
export interface SessionData {
	state: "idle" | "searchCommand" | "spotifySongSelect" | "youtubeSongSelect";
	spotifyMusics: SpotifyMusicInfo[];
	selectedSpotifyMusic: number | null;
	youtubeVideos: string[];
}

// Flavor the context type to include sessions.
export type MyContext = Context & SessionFlavor<SessionData>;

export const initialSession: () => SessionData = () => ({
	state: "idle",
	spotifyMusics: [],
	selectedSpotifyMusic: null,
	youtubeVideos: []
});

export const songSearchKeyboard = new Keyboard().placeholder("song name and artist").text("Cancel");

export const selectionKeyboard = new Keyboard().text("1").text("2").text("3").text("4").text("5").row().text("Cancel");
