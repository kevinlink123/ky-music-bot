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