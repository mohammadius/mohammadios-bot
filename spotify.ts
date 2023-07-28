import { spotifyMusicInfoArrayZod, type SpotifyMusicInfoArray } from "./types/spotify.ts";

export const searchMusic: (query: string) => Promise<SpotifyMusicInfoArray> = async (query: string) => {
	const url = "https://spotify-search-api-sigma.vercel.app/api/search?" + new URLSearchParams({ query });
	const response = await fetch(url);

	const result = await response.json();

	return spotifyMusicInfoArrayZod.parse(result);
};
