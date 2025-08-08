import { Message, OmitPartialGroupDMChannel } from "discord.js";
import { CONSTANS } from "../constans";
import fs from 'fs';
import path from "path";
import { exec } from "youtube-dl-exec";
import { ActivePlayer, Song } from "../types";

export function getRandomSong(serverId: string) {
	const serverMusicPath = path.join(CONSTANS.MUSIC_DIR, serverId);
	const localSongs = fs.readdirSync(serverMusicPath);
	const randomSongName = localSongs[Math.floor(Math.random() * (localSongs.length))];
	return path.join(serverMusicPath, randomSongName);
}

export function searchSongByName(songName: string, serverId: string) {
	const serverMusicPath = path.join(CONSTANS.MUSIC_DIR, serverId);
	const localSongs = fs.readdirSync(serverMusicPath);
	const foundSong = localSongs.find((song: string) => {
			return song.toLowerCase().includes(songName);
	});

	return foundSong ? path.join(serverMusicPath, foundSong) : "";
}

export async function downloadFromYTPlaylist(playlistUrl: string, serverId: string, isPlaylist: boolean) {
	const serverMusicFolder = path.join(CONSTANS.MUSIC_DIR, serverId);
	if (!fs.existsSync(serverMusicFolder)) {
		fs.mkdirSync(serverMusicFolder, { recursive: true });
	}

	const downloadOptions = isPlaylist ? {
		extractAudio: true,
		audioFormat: 'mp3',
		output: path.join(serverMusicFolder, '%(title)s.%(ext)s'),
		yesPlaylist: isPlaylist,
		quiet: true
	} : {
		extractAudio: true,
		audioFormat: 'mp3',
		output: path.join(serverMusicFolder, '%(title)s.%(ext)s'),
		noPlaylist: !isPlaylist,
		quiet: true
	}

	console.log('Descargando playlist...');
	await exec(playlistUrl, downloadOptions);
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
  const isYoutubeLink = (url.includes(".com") || url.includes("https://")) || (url.includes("youtube.com") || url.includes("youtu.be"));
  return isYoutubeLink;
}

export function isRealPlaylist(url: string) {
	const isValidYoutubeLink = (url.includes(".com") || url.includes("https://")) || (url.includes("youtube.com") || url.includes("youtu.be"));
	if(!isValidYoutubeLink) return false;

	const urlObj = new URL(url);
	const listParam = urlObj.searchParams.get('list');

	if (!listParam) return false;

	if(listParam.startsWith("RD")) return false;

	return true;
}

export function getDefaultSongQueue(serverId: string) {
	const serverMusicFolder = path.join(CONSTANS.MUSIC_DIR, serverId);
	return fs.readdirSync(serverMusicFolder)
		.filter(file => file.endsWith('.mp3'))
		.map(file => {
			return {
				url: path.join(serverMusicFolder, file),
				title: file,
				local: true
			}
		});
}

export function randomizeQueue(songs: Song[]) {
	let shuffledQueue = [...songs];
	let currentIndex = shuffledQueue.length;

	while (currentIndex != 0) {
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		[shuffledQueue[currentIndex], shuffledQueue[randomIndex]] = [shuffledQueue[randomIndex], shuffledQueue[currentIndex]];
	}

	return shuffledQueue;
}