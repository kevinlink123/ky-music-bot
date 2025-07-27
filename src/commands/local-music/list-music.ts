import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { CONSTANS } from '../../constans';
import fs from 'fs';
import { isMusicInFolder } from '../../utils/localHandler';

module.exports = {
	data: new SlashCommandBuilder()
	  .setName('list-music')
		.setDescription('Muestra por mensajes las canciones disponibles'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>	) {
		// interaction.guild is the object representing the Guild in which the command was run
		if (!isMusicInFolder()) {
			await interaction.reply("No descargaron nada todavia mogodowns");
			return;	
		}

		await interaction.deferReply();
		const message = ['**Todas estas canciones tengo guardadas:**'];
		const fileNames = fs.readdirSync(CONSTANS.MUSIC_DIR);
		for (const file of fileNames) {
			message.push(file.slice(0, file.lastIndexOf(".")));
		}

		await interaction.editReply(message.join("\n"));
	},
};