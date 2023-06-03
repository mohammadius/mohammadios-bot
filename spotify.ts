import { encode as toBase64 } from "https://deno.land/std@0.190.0/encoding/base64.ts";
import { type SpotifySearchResponse } from "./spotify.types.ts";
import env from "./env.ts";

const getAccessTokenRequestOptions: RequestInit = {
	method: "POST",
	headers: {
		Authorization: `Basic ${toBase64(`${env.SPOTIFY_ID}:${env.SPOTIFY_SECRET}`)}`,
		"Content-Type": "application/x-www-form-urlencoded"
	},
	body: "grant_type=client_credentials"
};

const tokenData = { accessToken: "", expiresAfter: 0 };

export const getAccessToken = async () => {
	if (Date.now() < tokenData.expiresAfter) {
		return tokenData.accessToken;
	}

	const response = await fetch("https://accounts.spotify.com/api/token", getAccessTokenRequestOptions);

	const { access_token: accessToken }: { access_token: string } = await response.json();

	tokenData.accessToken = accessToken;
	tokenData.expiresAfter = Date.now() + 3300000;

	return accessToken;
};

export type SpotifyMusicInfo = {
	name: string;
	trackNumber: number;
	duration: number;
	artists: string[];
	albumName: string;
	albumReleaseYear: string;
	albumArtists: string[];
	albumImage: string;
	totalTracks: number;
};

export const searchMusic: (query: string) => Promise<SpotifyMusicInfo[]> = async (query: string) => {
	const accessToken = await getAccessToken();

	const url = "https://api.spotify.com/v1/search?" + new URLSearchParams({ q: query, type: "track", limit: "5" });
	const response = await fetch(url, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	const { tracks }: SpotifySearchResponse = await response.json();

	return tracks.items.map((item) => ({
		name: item.name,
		trackNumber: item.track_number,
		duration: Math.round(item.duration_ms / 1000),
		artists: item.artists.map((artist) => artist.name),
		albumName: item.album.name,
		albumReleaseYear: item.album.release_date.slice(0, 4),
		albumArtists: item.album.artists.map((artist) => artist.name),
		albumImage: item.album.images.reduce((prev, current) => (prev.width > current.width ? prev : current)).url,
		totalTracks: item.album.total_tracks
	}));
};
