export type SpotifySearchResponse = {
	tracks: Tracks;
};

export type Tracks = {
	href: string;
	items: Item[];
};

export type Item = {
	album: Album;
	artists: Artist[];
	available_markets: string[];
	disc_number: number;
	duration_ms: number;
	explicit: boolean;
	external_ids: ExternalIDS;
	external_urls: ExternalUrls;
	href: string;
	id: string;
	is_local: boolean;
	name: string;
	popularity: number;
	preview_url: string;
	track_number: number;
	type: string;
	uri: string;
};

export type Album = {
	album_group: string;
	album_type: string;
	artists: Artist[];
	available_markets: string[];
	external_urls: ExternalUrls;
	href: string;
	id: string;
	images: Image[];
	name: string;
	release_date: string;
	release_date_precision: string;
	total_tracks: number;
	type: string;
	uri: string;
};

export type Artist = {
	external_urls: ExternalUrls;
	href: string;
	id: string;
	name: string;
	type: Type;
	uri: string;
};

export type ExternalUrls = {
	spotify: string;
};

export enum Type {
	Artist = "artist"
}

export type Image = {
	height: number;
	url: string;
	width: number;
};

export type ExternalIDS = {
	isrc: string;
};
