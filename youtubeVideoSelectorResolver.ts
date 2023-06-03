import { Buffer } from "node:buffer";
import { InputFile, type CommandContext } from "https://deno.land/x/grammy@v1.16.1/mod.ts";
import ytdl from "https://deno.land/x/ytdl_core@v0.1.2/mod.ts";
import { type DownloadOptions } from "https://deno.land/x/ytdl_core@v0.1.2/src/types.ts";
import NodeID3 from "npm:node-id3";
import { initialSession, type MyContext } from "./botHelpers.ts";
import { SpotifyMusicInfo } from "./spotify.ts";
import { downloadImage } from "./utility.ts";
import { logger } from "./logging.ts";

const ytdlDownloadOptions: DownloadOptions = {
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

export default async function (ctx: CommandContext<MyContext>, id: number) {
	const selectedVideo = ctx.session.youtubeVideos[id];
	const musicInfo: SpotifyMusicInfo = ctx.session.spotifyMusics[ctx.session.selectedSpotifyMusic!];

	const musicFileName = `${musicInfo.artists[0]} - ${musicInfo.name}`;
	const imageFileName = await downloadImage(musicInfo.albumImage, musicFileName);

	logger.info("{username}: downloaded image {imageFileName}", {
		username: ctx.from?.username,
		imageFileName: imageFileName
	});

	const stream = await ytdl(selectedVideo, ytdlDownloadOptions);

	const chunks: Uint8Array[] = [];

	for await (const chunk of stream) {
		chunks.push(chunk);
	}

	logger.info("{username}: youtube download for {selectedVideo} ended with the format of {format}", {
		username: ctx.from?.username,
		selectedVideo: selectedVideo,
		format: stream.format
	});

	const musicFileNameMp3 = musicFileName + ".mp3";
	const musicFileNameWithExt = musicFileName + "." + stream.format.container;
	await Deno.writeFile(musicFileNameWithExt, new Uint8Array(await new Blob(chunks).arrayBuffer()));
	await new Deno.Command("/usr/bin/ffmpeg", { args: ["-i", musicFileNameWithExt, "-y", musicFileNameMp3] }).output();

	const mp3Buffer = await NodeID3.Promise.write(
		{
			title: musicInfo.name,
			trackNumber: `${musicInfo.trackNumber}/${musicInfo.totalTracks}`,
			artist: musicInfo.artists.join("/"),
			album: musicInfo.albumName,
			year: musicInfo.albumReleaseYear,
			image: imageFileName
		},
		Buffer.from(await Deno.readFile(musicFileNameMp3))
	);

	const audioMessage = await ctx.replyWithAudio(new InputFile(mp3Buffer, musicFileNameMp3), {
		duration: parseInt(stream.format.approxDurationMs!) / 1000
	});

	ctx.session = initialSession();

	await Promise.allSettled([
		ctx.deleteMessage(),
		ctx.api.forwardMessage("@MohammadiosBotSongs", ctx.chat.id, audioMessage.message_id),
		Deno.remove(musicFileNameWithExt),
		Deno.remove(imageFileName),
		Deno.remove(musicFileNameMp3)
	]);
}
