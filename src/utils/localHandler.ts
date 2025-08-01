import { Message, OmitPartialGroupDMChannel } from "discord.js";
import { CONSTANS } from "../constans";
import fs from 'fs';
import path from "path";
import { exec } from "youtube-dl-exec";
import { ActivePlayer } from "@/types";

export function searchSongByName(songName: string, serverId: string) {
	const serverMusicPath = path.join(CONSTANS.MUSIC_DIR, serverId);
	const localSongs = fs.readdirSync(serverMusicPath);
	const foundSong = localSongs.find((song: string) => {
			return song.toLowerCase().includes(songName);
	});

	return foundSong ? path.join(serverMusicPath, foundSong) : "";
}

export async function downloadFromYTPlaylist(playlistUrl: string, serverId: string) {
	const serverMusicFolder = path.join(CONSTANS.MUSIC_DIR, serverId);
	if (!fs.existsSync(serverMusicFolder)) {
		fs.mkdirSync(serverMusicFolder, { recursive: true });
	}

	console.log('Descargando playlist...');
	await exec(playlistUrl, {
		extractAudio: true,
		audioFormat: 'mp3',
		output: path.join(serverMusicFolder, '%(title)s.%(ext)s'),
		yesPlaylist: true,
		quiet: true
	});
	console.log('¡Descarga completada!');

	return fs.readdirSync(serverMusicFolder)
		.filter(file => file.endsWith('.mp3'))
		.map(file => path.join(serverMusicFolder, file));
}

export function flushMusic(message: OmitPartialGroupDMChannel<Message>) {
	console.log(CONSTANS.MUSIC_DIR);
	if (!isMusicInFolder(message.guildId!)) {
		message.channel.send("No me dieron nada para descargar todavia autistas");
		return;
	}
	message.channel.send("YA MISMO ELIMINO TODO LOCO, ME HINCHE LAS PELOTAS");
	fs.rmSync(CONSTANS.MUSIC_DIR, { recursive: true, force: true });
	message.channel.send("Ahi termine, todo limpiecito");
}

export function isMusicInFolder(guildId: string) {
	return fs.existsSync(path.join(CONSTANS.MUSIC_DIR, guildId)) ? 
	fs.readdirSync(path.join(CONSTANS.MUSIC_DIR, guildId)).some(f => f.endsWith('.mp3')) : 
	false;
}

export function validateUrl(url: string): boolean {
  const isYoutubeLink = url.includes("youtube.com") || url.includes("youtu.be");
  const isPlaylist = url.includes("&list") || url.includes("playlist");
  return isYoutubeLink && isPlaylist;
}

export function togglePlayState(activePlayer: ActivePlayer) {
	activePlayer.playing = !activePlayer.playing;
	return activePlayer.playing;
}