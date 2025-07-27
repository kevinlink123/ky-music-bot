import { Message, OmitPartialGroupDMChannel } from "discord.js";
import { CONSTANS } from "../constans";
import fs from 'fs';
import path from "path";
import { exec } from "youtube-dl-exec";

export function searchSongByName(songName: string) {
	const localSongs = fs.readdirSync(CONSTANS.MUSIC_DIR);
	const foundSong = localSongs.find((song: string) => {
			return song.toLowerCase().includes(songName);
	})

	return foundSong;
}

export async function downloadFromYTPlaylist(playlistUrl: string) {
	if (!fs.existsSync(CONSTANS.MUSIC_DIR)) {
		fs.mkdirSync(CONSTANS.MUSIC_DIR, { recursive: true });
	}

	console.log('Descargando playlist...');
	await exec(playlistUrl, {
		extractAudio: true,
		audioFormat: 'mp3',
		output: path.join(CONSTANS.MUSIC_DIR, '%(title)s.%(ext)s'),
		yesPlaylist: true,
		quiet: true
	});
	console.log('¡Descarga completada!');

	return fs.readdirSync(CONSTANS.MUSIC_DIR)
		.filter(file => file.endsWith('.mp3'))
		.map(file => path.join(CONSTANS.MUSIC_DIR, file));
}

export function flushMusic(message: OmitPartialGroupDMChannel<Message>) {
	console.log(CONSTANS.MUSIC_DIR);
	if (!isMusicInFolder()) {
		message.channel.send("No me dieron nada para descargar todavia autistas");
		return;
	}
	message.channel.send("YA MISMO ELIMINO TODO LOCO, ME HINCHE LAS PELOTAS");
	fs.rmSync(CONSTANS.MUSIC_DIR, { recursive: true, force: true });
	message.channel.send("Ahi termine, todo limpiecito");
}


function musicExists() {
	return fs.existsSync(CONSTANS.MUSIC_DIR);
}

export function isMusicInFolder() {
	return musicExists() && fs.readdirSync(CONSTANS.MUSIC_DIR).some(fileName => fileName.endsWith('.mp3'));
}

export function validateUrl(url: string): boolean {
  const isYoutubeLink = url.includes("youtube.com") || url.includes("youtu.be");
  const isPlaylist = url.includes("&list") || url.includes("playlist");
  return isYoutubeLink && isPlaylist;
}