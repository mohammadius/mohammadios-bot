import { encode as toBase64 } from "https://deno.land/std@0.190.0/encoding/base64.ts";
import type { AccessToken, SearchContent } from "npm:spotify-types";
import env from "./env.ts";
import redis from "./redis.ts";
import { spotifyMusicInfoArrayZod, type SpotifyMusicInfoArray } from "./types/spotify.ts";

const getAccessTokenRequestOptions: RequestInit = {
	method: "POST",
	headers: {
		Authorization: `Basic ${toBase64(`${env.SPOTIFY_ID}:${env.SPOTIFY_SECRET}`)}`,
		"Content-Type": "application/x-www-form-urlencoded"
	},
	body: "grant_type=client_credentials"
};

export const getAccessToken = async () => {
	const oldToken = await redis.get("spotifyAccessToken");

	if (oldToken !== null && oldToken !== undefined) {
		return oldToken;
	}

	const response = await fetch("https://accounts.spotify.com/api/token", getAccessTokenRequestOptions);

	const { access_token, expires_in }: AccessToken = await response.json();

	await redis.set("spotifyAccessToken", access_token, { ex: expires_in - 300 });

	return access_token;
};

export const searchMusic: (query: string) => Promise<SpotifyMusicInfoArray> = async (query: string) => {
	const searchMusicRequestOptions: RequestInit = {
		method: "GET",
		headers: {
			Authorization: `Bearer ${await getAccessToken()}`
		}
	};

	const url = "https://api.spotify.com/v1/search?" + new URLSearchParams({ q: query, type: "track", limit: "5" });
	const response = await fetch(url, searchMusicRequestOptions);

	const { tracks }: SearchContent = await response.json();

	return spotifyMusicInfoArrayZod.parse(
		tracks!.items.map((item) => ({
			name: item.name,
			trackNumber: item.track_number,
			duration: Math.round(item.duration_ms / 1000),
			artists: item.artists.map((artist) => artist.name),
			albumName: item.album.name,
			albumReleaseYear: item.album.release_date.slice(0, 4),
			albumArtists: item.album.artists.map((artist) => artist.name),
			albumImage: item.album.images.reduce((prev, current) =>
				(prev.width ?? prev.height ?? 1) > (current.width ?? current.height ?? 0) ? prev : current
			).url,
			totalTracks: item.album.total_tracks
		}))
	);
};
