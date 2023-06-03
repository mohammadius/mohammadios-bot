import { searchVideo } from "./lib/search.ts";

export const Name = (name: string) => `Hello ${name}`;

export function search(searchQuery: string, dur: string) {
	return searchVideo(searchQuery, dur);
}
