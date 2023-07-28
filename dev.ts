import { searchMusic } from "./spotify.ts";
import { search as ytSearch } from "./youtube-search/mod.ts";

try {
	const videos = (await ytSearch(`hailee $coast`, "EgIQAQ%253D%253D")).slice(0, 5);
	console.log(videos);
	// const result = await searchMusic("take it off fisher");
	// console.log(result.map((x, i) => `${i + 1}: ${x.artists.join(", ")} - ${x.name} (Album: ${x.albumName})`).join("\n"));
} catch (e) {
	console.error(e);
}
