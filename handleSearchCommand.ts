import { type CommandContext } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { logger } from "./logging.ts";
import { selectionKeyboard } from "./botHelpers.ts";
import { type MyContext } from "./types/bot.ts";
import { searchMusic } from "./spotify.ts";

export default async function handleSearchCommand(ctx: CommandContext<MyContext>, message: string) {
	try {
		logger.info("{username}: searched for {query}", { username: ctx.from?.username, query: message });

		const result = await searchMusic(message);

		logger.info("{username}: spotify search found {songs}", {
			username: ctx.from?.username,
			songs: result
		});

		ctx.session.state = "spotifySongSelect";
		ctx.session.spotifyMusics = result;

		await ctx.reply(
			"Select one of the sings, it is used just for the info:\n" +
				result.map((x, i) => `${i + 1}: ${x.artists.join(", ")} - ${x.name} (Album: ${x.albumName})`).join("\n"),
			{
				reply_markup: selectionKeyboard
			}
		);
	} catch (e) {
		logger.error("{username}: error in handleSearchCommand: {error}", {
			username: ctx.from?.username,
			error: e
		});
	}
}
