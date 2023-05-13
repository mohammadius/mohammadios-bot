import { Bot, InputFile, session } from "grammy";
import { Menu } from "@grammyjs/menu";
import ytdl from "ytdl-core";
import fs from "fs/promises";
import * as yt from "youtube-search-without-api-key";
import NodeID3 from "node-id3";
import { execSync } from "node:child_process";
import type { MyContext, SessionData } from "./bot.types";
import { SpotifyMusicInfo, searchMusic } from "./spotify";
import { downloadImage, shellCommand } from "./utility";
import { logger } from "./logging";

const bot = new Bot<MyContext>(process.env.BOT_TOKEN);

logger.info("MohammadiosBot started!");

const initial: () => SessionData = () => ({
	spotifyMusics: [],
	selectedSpotifyMusic: null,
	youtubeVideos: []
});

bot.use(session({ initial }));

const ytdlDownloadOptions: ytdl.downloadOptions = {
	requestOptions: {
		headers: {
			cookie:
				"CONSENT=PENDING+159; LOGIN_INFO=AFmmF2swRQIgczXQAExQk2J5HkrrIpSBuYi47pryB9zJOAw3oYJr7jsCIQCGNpP_n7dgkcii6SheqXy6kSliSGwv6BWr45Ns3vMK7w:QUQ3MjNmekpBVmNYUXU3Z1JfRXVSU2k2blBJYWNmNU9CNXVLdFBuYWZoMm9NOGIxbHdkRVBfdWpiNS1JUnE1RkRjRHBVekxSLWpIMFhOMzRoVUZjQWdGOGtCOENWZU1EVnRuOVhaZVlidFA5bW01dUg4TDZ4RnRmSEdCdHdCTTRSWXZvREEyc2lMTmVOLVlEYkVwVnotTFFKUHNIbFp5SWd3; __Secure-YEC=CgtNTF9XY2ZHb29wOCiZ3PKUBg==; VISITOR_INFO1_LIVE=xrK4Tf7-g7U; HSID=AEyxX5WtWw0szABA9; SSID=Ao8mB1f18DmBvUZBn; APISID=jQyVVaMs9LlOr2Ct/ALUmADJdV4EgmC672; SAPISID=bieefvMH4zDCpPxB/AD81dk9XyQLn-nEUy; __Secure-1PAPISID=bieefvMH4zDCpPxB/AD81dk9XyQLn-nEUy; __Secure-3PAPISID=bieefvMH4zDCpPxB/AD81dk9XyQLn-nEUy; _ga=GA1.2.630877318.1666477343; DEVICE_INFO=ChxOekU0T1RFNU5qTTRPREkxTXpFNE16VXdOZz09EIbQlJ4GGIbQlJ4G; PREF=tz=Asia.Tehran&f6=40000000&gl=US&f5=30000&f7=150&f4=4000000; SID=WQhjG4G91HYB9p1L7BdBYgfUZAj4LW9f_EuUm7XOdvMaVyA9VYIoQHCaSxxPPAtCCfXMJQ.; __Secure-1PSID=WQhjG4G91HYB9p1L7BdBYgfUZAj4LW9f_EuUm7XOdvMaVyA9EoOU1h6RBBf4s8t7gJtGAw.; __Secure-3PSID=WQhjG4G91HYB9p1L7BdBYgfUZAj4LW9f_EuUm7XOdvMaVyA9uzDhX3Vep-gS-Z7F10Lu1Q.; YSC=MmA9miSNdU0; wide=1; SIDCC=AP8dLtwpBe2eLVhUC56W95892liHJU582sAfIkXmKLpiiMJE5yzezhx1gf0sxKa_DCOn_rkQjJM; __Secure-1PSIDCC=AP8dLtztU-b737X4k27refG0YH5CGdElXS44q_f7CtBro8JAR0mZu6iLGCs6e3LT3tQ9jLFcogfO; __Secure-3PSIDCC=AP8dLtw9GCXqceYO4tveAlI7L4brIunnciH_O20jtZo1e7O2KFKsYLYGJX9NoHL7HUHEyDESXng",
			"x-youtube-identity-token": "QUFFLUhqa0VDazhySWlXTlZyREdQMmJ5dUNIYnNRN3pJQXw="
		}
	},
	quality: "highestaudio",
	filter: "audioonly"
};

const youtubeVideoSelectorResolver = (id: number) => async (ctx: any) => {
	const selectedVideo = ctx.session.youtubeVideos[id];
	const musicInfo: SpotifyMusicInfo = ctx.session.spotifyMusics[ctx.session.selectedSpotifyMusic!];

	logger.info("{username}: selected video {video}", {
		username: ctx.from?.username,
		video: selectedVideo
	});

	const musicFileName = `${musicInfo.artists[0]} - ${musicInfo.name}`;
	const imageFileName = await downloadImage(musicInfo.albumImage, musicFileName);

	logger.info("{username}: downloaded image {imageFileName}", {
		username: ctx.from?.username,
		imageFileName: imageFileName
	});

	const { videoDetails } = await ytdl.getInfo(selectedVideo, ytdlDownloadOptions);

	logger.info("{username}: ytdl.getInfo result for {videoDetails}", {
		username: ctx.from?.username,
		videoDetails: videoDetails.title
	});

	const video = ytdl(selectedVideo, ytdlDownloadOptions);

	logger.info("{username}: starting youtube download", {
		username: ctx.from?.username
	});

	let bufs: Uint8Array[] = [];

	video.on("data", (data) => {
		bufs.push(data);
	});

	video.on("end", async () => {
		logger.info("{username}: download ended", {
			username: ctx.from?.username
		});

		const { fileTypeFromBuffer } = await import("file-type");

		let buffer = Buffer.concat(bufs);
		const fileType = await fileTypeFromBuffer(buffer);
		if (fileType === null || fileType === undefined) {
			return;
		}

		const musicFileNameMp3 = musicFileName + ".mp3";

		if (fileType.ext !== "mp3") {
			logger.info("{username}: converting from {fileType} to mp3", {
				username: ctx.from?.username,
				fileType: fileType
			});

			const musicFileNameWithExt = musicFileName + "." + fileType.ext;
			await fs.writeFile(musicFileNameWithExt, buffer);
			execSync(shellCommand(["ffmpeg", "-i", musicFileNameWithExt, "-y", musicFileNameMp3]));
			await fs.rm(musicFileNameWithExt);
			buffer = await fs.readFile(musicFileNameMp3);
		}

		const newBuffer = NodeID3.write(
			{
				title: musicInfo.name,
				trackNumber: `${musicInfo.trackNumber}/${musicInfo.totalTracks}`,
				artist: musicInfo.artists.join("/"),
				album: musicInfo.albumName,
				year: musicInfo.albumReleaseYear,
				image: imageFileName
			},
			buffer
		);

		await fs.writeFile(musicFileNameMp3, newBuffer);
		await fs.rm(imageFileName);

		const audioMessage = await ctx.replyWithAudio(new InputFile(musicFileNameMp3), { duration: parseInt(videoDetails.lengthSeconds) });

		logger.info("{username}: added metadata and sent audio", {
			username: ctx.from?.username
		});

		await ctx.api.forwardMessage("@MohammadiosBotSongs", ctx.chat.id, audioMessage.message_id);

		await fs.rm(musicFileNameMp3);
	});

	await ctx.deleteMessage();

	ctx.session = initial();
};

const ytVideoSelectorMenu = new Menu<MyContext>("youtube-video-selector")
	.text("1", youtubeVideoSelectorResolver(0))
	.text("2", youtubeVideoSelectorResolver(1))
	.text("3", youtubeVideoSelectorResolver(2))
	.text("4", youtubeVideoSelectorResolver(3))
	.text("5", youtubeVideoSelectorResolver(4));

bot.use(ytVideoSelectorMenu);

const spotifyMusicSelectorResolver = (id: number) => async (ctx: any) => {
	ctx.session.selectedSpotifyMusic = id;
	const musicInfo = ctx.session.spotifyMusics[ctx.session.selectedSpotifyMusic];

	logger.info("{username}: selected song {song}", {
		username: ctx.from?.username,
		song: musicInfo
	});

	const videos = (await yt.search(`${musicInfo.artists[0]} ${musicInfo.name}`, "EgIQAQ%253D%253D")).slice(0, 5);

	logger.info("{username}: youtube search found {videos}", {
		username: ctx.from?.username,
		videos: videos
	});

	ctx.session.youtubeVideos = videos.map((x) => x.url);

	await ctx.deleteMessage();

	await ctx.reply(videos.map((x, i) => `${i + 1}- ${x.url}: ${x.title}`).join("\n"), {
		reply_markup: ytVideoSelectorMenu,
		disable_web_page_preview: true
	});
};

const spotifyMusicSelectorMenu = new Menu<MyContext>("spotify-music-selector")
	.text("1", spotifyMusicSelectorResolver(0))
	.text("2", spotifyMusicSelectorResolver(1))
	.text("3", spotifyMusicSelectorResolver(2))
	.text("4", spotifyMusicSelectorResolver(3))
	.text("5", spotifyMusicSelectorResolver(4));
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

	ctx.session.spotifyMusics = result;
	ctx.session.selectedSpotifyMusic = null;
	ctx.session.youtubeVideos = [];

	await ctx.reply(result.map((x, i) => `${i + 1}: ${x.artists.join(", ")} - ${x.name} (Album: ${x.albumName})`).join("\n"), {
		reply_markup: spotifyMusicSelectorMenu
	});
});

// const youtubeVideoIdRegex = /^(?:(?:https?:)?\/\/)?(?:(?:www|m)\.)?(?:(?:youtube(?:-nocookie)?\.com|youtu.be))(?:\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(?:\S+)?$/;

// Handle other messages.
bot.on("message", (ctx) => ctx.reply("use /search to search for a song, like this:\n/search NK Elefante"));

bot.start();
