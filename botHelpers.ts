import { Keyboard } from "https://deno.land/x/grammy@v1.16.1/convenience/keyboard.ts";
import { type SessionData } from "./types/bot.ts";

export const initialSession: () => SessionData = () => ({
	state: "idle",
	spotifyMusics: [],
	selectedSpotifyMusic: null,
	youtubeVideos: []
});

export const songSearchKeyboard = new Keyboard().placeholder("song name and artist").text("Cancel").resized();

export const selectionKeyboard = new Keyboard().text("1").text("2").text("3").text("4").text("5").row().text("Cancel").resized();
