import { SlashCommandBuilder } from 'discord.js';
import { CONSTANS } from '../../constans';
import fs from 'fs';
import { isMusicInFolder } from '../../utils/localHandler';

module.exports = {
	data: new SlashCommandBuilder()
	  .setName('list-music')
		.setDescription('Muestra por mensajes las canciones disponibles'),
	async execute(interaction: any) {
		// interaction.guild is the object representing the Guild in which the command was run
		if (isMusicInFolder()) {
			await interaction.reply("No descargaron nada todavia mogodowns");
			return;	
		}
		
		await interaction.reply("Estas son las canciones que tengo para reproducir:");
		const fileNames = fs.readdirSync(CONSTANS.MUSIC_DIR);
		for (const file of fileNames) {
			await interaction.reply(file);
		}
	},
};