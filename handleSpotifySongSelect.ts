import { type CommandContext } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { selectionKeyboard } from "./botHelpers.ts";
import { type MyContext } from "./types/bot.ts";
import { logger } from "./logging.ts";
import { search as ytSearch } from "./youtube-search/mod.ts";

export default async function handleSpotifySongSelect(ctx: CommandContext<MyContext>, message: string) {
	try {
		let id = parseInt(message) - 1;

		if (id < 0) {
			id = 0;
		} else if (id > 5) {
			id = 5;
		}

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

		ctx.session.state = "youtubeSongSelect";
		ctx.session.youtubeVideos = videos.map((x) => x.url);

		await ctx.reply(
			"Select one of the videos, the audio will be used and mixed with the selected info from before:\n" +
				videos.map((x, i) => `${i + 1}- ${x.url}: ${x.title}`).join("\n"),
			{
				reply_markup: selectionKeyboard,
				disable_web_page_preview: true
			}
		);
	} catch (e) {
		logger.error("{username}: error in handleSpotifySongSelect: {error}", {
			username: ctx.from?.username,
			error: e
		});
	}
}
