import { Bot, session, type CommandContext } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import { run, sequentialize } from "https://deno.land/x/grammy_runner@v2.0.3/mod.ts";
import env from "./env.ts";
import { logger } from "./logging.ts";
import { initialSession, songSearchKeyboard, type MyContext, type SessionData } from "./botHelpers.ts";
import { notEmpty } from "./utility.ts";
import handleYoutubeSongSelect from "./handleYoutubeSongSelect.ts";
import handleSpotifySongSelect from "./handleSpotifySongSelect.ts";
import handleSearchCommand from "./handleSearchCommand.ts";
import { RedisAdapter } from "./redisAdapter.ts";

const bot = new Bot<MyContext>(env.BOT_TOKEN);

await bot.api.setMyCommands([
	{ command: "start", description: "Start the bot" },
	{ command: "help", description: "Show help text" },
	{ command: "search", description: "Search for song to download" }
]);

logger.info("MohammadiosBot started!");

bot.use(
	sequentialize((ctx) => {
		const chat = ctx.chat?.id.toString();
		const user = ctx.from?.id.toString();

		return [chat, user].filter(notEmpty);
	})
);

bot.use(session({ initial: initialSession, storage: new RedisAdapter<SessionData>() }));

// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

bot.command("help", (ctx) =>
	ctx.reply(
		"/help See this help message!\n" +
			"/search Search and download a song from youtube with metadata from spotify!\n" +
			"Downloaded songs also are forwarded to @MohammadiosBotSongs channel. you can check there to avoid downloading a song multiple times."
	)
);

// Handle the /search command.
bot.command("search", async (ctx) => {
	if (ctx.session.state !== "idle") {
		ctx.session = initialSession();
	}
	ctx.session.state = "searchCommand";

	await ctx.reply("search a song with title and preferably artist", {
		reply_markup: songSearchKeyboard
	});
});

bot.on("message:text", async (ctx) => {
	const msg = ctx.msg.text.trim();

	if (msg.length === 0) {
		await ctx.reply("try again!");
		return;
	}

	if (msg === "Cancel") {
		await ctx.reply("cancelled!", { reply_markup: { remove_keyboard: true } });
		ctx.session = initialSession();
		return;
	}

	switch (ctx.session.state) {
		case "idle":
			await ctx.reply("use /help to see what i can do!");
			break;
		case "searchCommand":
			await handleSearchCommand(ctx as CommandContext<MyContext>, msg);
			break;
		case "spotifySongSelect":
			await handleSpotifySongSelect(ctx as CommandContext<MyContext>, msg);
			break;
		case "youtubeSongSelect":
			await handleYoutubeSongSelect(ctx as CommandContext<MyContext>, msg);
			break;
	}
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
