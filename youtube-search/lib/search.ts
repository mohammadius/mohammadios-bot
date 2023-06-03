import { ParserService } from "./parser.service.ts";
import got from "npm:got";

const rfc3986EncodeURIComponent = (str: string) => encodeURIComponent(str).replace(/[!'()*]/g, escape);

export async function searchVideo(searchQuery: string, dur: string) {
	const YOUTUBE_URL = "https://www.youtube.com";
	const duration = { under: "EgQQARgB", between: "EgQQARgD", over: "EgQQARgC" };
	type ObjectKey = keyof typeof duration;
	const durKey = dur as ObjectKey;

	const results = [];
	let details = [];
	let fetched = false;
	const options = { type: "video", limit: 0 };

	// deno-lint-ignore no-explicit-any
	const searchRes: any = await got.get(
		`${YOUTUBE_URL}/results?q=${rfc3986EncodeURIComponent(searchQuery.trim())}&hl=en${
			duration[durKey] ? "&sp=" + duration[durKey] : dur ? "&sp=" + dur : ""
		}`
	);
	let html = await searchRes.body;
	// try to parse html
	try {
		const data = html.split("ytInitialData = '")[1].split("';</script>")[0];
		html = data.replace(/\\x([0-9A-F]{2})/gi, (...items: string[]) => {
			return String.fromCharCode(parseInt(items[1], 16));
		});
		html = html.replaceAll('\\\\"', "");
		html = JSON.parse(html);
		// deno-lint-ignore no-unused-vars no-empty
	} catch (e) {}

	if (
		html &&
		html.contents &&
		html.contents.sectionListRenderer &&
		html.contents.sectionListRenderer.contents &&
		html.contents.sectionListRenderer.contents.length > 0 &&
		html.contents.sectionListRenderer.contents[0].itemSectionRenderer &&
		html.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents.length > 0
	) {
		details = html.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
		fetched = true;
	}
	// backup/ alternative parsing
	if (!fetched) {
		try {
			details = JSON.parse(
				html
					.split('{"itemSectionRenderer":{"contents":')
					[html.split('{"itemSectionRenderer":{"contents":').length - 1].split(',"continuations":[{')[0]
			);
			fetched = true;
			// deno-lint-ignore no-unused-vars no-empty
		} catch (e) {}
	}
	if (!fetched) {
		try {
			details = JSON.parse(
				html
					.split('{"itemSectionRenderer":')
					[html.split('{"itemSectionRenderer":').length - 1].split('},{"continuationItemRenderer":{')[0]
			).contents;
			fetched = true;
			// deno-lint-ignore no-unused-vars no-empty
		} catch (e) {}
	}

	if (!fetched) return [];

	// tslint:disable-next-line:prefer-for-of
	for (let i = 0; i < details.length; i++) {
		if (typeof options.limit === "number" && options.limit > 0 && results.length >= options.limit) break;
		const data = details[i];

		const parserService = new ParserService();
		const parsed = parserService.parseVideo(data);
		if (!parsed) continue;
		const res = parsed;

		results.push(res);
	}

	return results;
}
