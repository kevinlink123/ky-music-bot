import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Te tiro info del server.'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		// interaction.guild is the object representing the Guild in which the command was run
		await interaction.reply(`Esta lleno de autistas ${interaction.guild!.name}. Son una banda, ${interaction.guild!.memberCount} para ser exactos. Ya califica como escuela especial esto.`);
	},
};
