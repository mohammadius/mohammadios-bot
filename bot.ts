import { Bot, session, type CommandContext } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { run, sequentialize } from "https://deno.land/x/grammy_runner@v2.0.3/mod.ts";
import { Menu } from "https://deno.land/x/grammy_menu@v1.2.0/mod.ts";
import { initialSession, type MyContext } from "./botHelpers.ts";
import { searchMusic } from "./spotify.ts";
import { logger } from "./logging.ts";
import env from "./env.ts";
import youtubeVideoSelectorResolver from "./youtubeVideoSelectorResolver.ts";
import spotifyMusicSelectorResolver from "./spotifyMusicSelectorResolver.ts";
import { notEmpty } from "./utility.ts";

const bot = new Bot<MyContext>(env.BOT_TOKEN);

logger.info("MohammadiosBot started!");

bot.use(
	sequentialize((ctx) => {
		const chat = ctx.chat?.id.toString();
		const user = ctx.from?.id.toString();

		return [chat, user].filter(notEmpty);
	})
);

bot.use(session({ initial: initialSession }));

export const ytVideoSelectorMenu = new Menu<MyContext>("youtube-video-selector")
	.text("1", (ctx) => youtubeVideoSelectorResolver(ctx as CommandContext<MyContext>, 0))
	.text("2", (ctx) => youtubeVideoSelectorResolver(ctx as CommandContext<MyContext>, 1))
	.text("3", (ctx) => youtubeVideoSelectorResolver(ctx as CommandContext<MyContext>, 2))
	.text("4", (ctx) => youtubeVideoSelectorResolver(ctx as CommandContext<MyContext>, 3))
	.text("5", (ctx) => youtubeVideoSelectorResolver(ctx as CommandContext<MyContext>, 4));

bot.use(ytVideoSelectorMenu);

const spotifyMusicSelectorMenu = new Menu<MyContext>("spotify-music-selector")
	.text("1", (ctx) => spotifyMusicSelectorResolver(ctx as CommandContext<MyContext>, 0, ytVideoSelectorMenu))
	.text("2", (ctx) => spotifyMusicSelectorResolver(ctx as CommandContext<MyContext>, 1, ytVideoSelectorMenu))
	.text("3", (ctx) => spotifyMusicSelectorResolver(ctx as CommandContext<MyContext>, 2, ytVideoSelectorMenu))
	.text("4", (ctx) => spotifyMusicSelectorResolver(ctx as CommandContext<MyContext>, 3, ytVideoSelectorMenu))
	.text("5", (ctx) => spotifyMusicSelectorResolver(ctx as CommandContext<MyContext>, 4, ytVideoSelectorMenu));

bot.use(spotifyMusicSelectorMenu);

// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

// Handle the /search command.
bot.command("search", async (ctx) => {
	const query = ctx.match;

	if (!!query && query.length === 0) {
		await ctx.reply("use /search to search for a song, like this:\n/search NK Elefante");
		return;
	}

	logger.info("{username}: searched for {query}", { username: ctx.from?.username, query: query });

	const result = await searchMusic(query);

	logger.info("{username}: spotify search found {songs}", {
		username: ctx.from?.username,
		songs: result
	});

	ctx.session = initialSession();
	ctx.session.spotifyMusics = result;

	await ctx.reply(result.map((x, i) => `${i + 1}: ${x.artists.join(", ")} - ${x.name} (Album: ${x.albumName})`).join("\n"), {
		reply_markup: spotifyMusicSelectorMenu
	});
});

// const youtubeVideoIdRegex = /^(?:(?:https?:)?\/\/)?(?:(?:www|m)\.)?(?:(?:youtube(?:-nocookie)?\.com|youtu.be))(?:\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(?:\S+)?$/;

// Handle other messages.
bot.on("message", (ctx) => ctx.reply("use /search to search for a song, like this:\n/search NK Elefante"));

const runner = run(bot);

// Stopping the bot when the Deno process is about to be terminated
const stopRunner = () => runner.isRunning() && runner.stop();

Deno.addSignalListener("SIGINT", stopRunner);
Deno.addSignalListener("SIGTERM", stopRunner);

await runner.task();
