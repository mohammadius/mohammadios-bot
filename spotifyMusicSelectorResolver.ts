import { type CommandContext } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { type Menu } from "https://deno.land/x/grammy_menu@v1.2.0/mod.ts";
import { type MyContext } from "./botHelpers.ts";
import { search as ytSearch } from "./youtube-search/mod.ts";
import { logger } from "./logging.ts";

export default async function (ctx: CommandContext<MyContext>, id: number, ytVideoSelectorMenu: Menu<MyContext>) {
	ctx.session.selectedSpotifyMusic = id;
	const musicInfo = ctx.session.spotifyMusics[ctx.session.selectedSpotifyMusic];

	logger.info("{username}: selected song {song}", {
		username: ctx.from?.username,
		song: musicInfo
	});

	const videos = (await ytSearch(`${musicInfo.artists[0]} ${musicInfo.name}`, "EgIQAQ%253D%253D")).slice(0, 5);

	logger.info("{username}: youtube search found {videos}", {
		username: ctx.from?.username,
		videos: videos
	});

	ctx.session.youtubeVideos = videos.map((x) => x.url);

	await Promise.allSettled([
		ctx.deleteMessage(),
		ctx.reply(videos.map((x, i) => `${i + 1}- ${x.url}: ${x.title}`).join("\n"), {
			reply_markup: ytVideoSelectorMenu,
			disable_web_page_preview: true
		})
	]);
}
