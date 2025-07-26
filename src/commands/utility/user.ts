import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Te digo si conozco al mogo.'),
	async execute(interaction: ChatInputCommandInteraction<CacheType>) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		await interaction.reply(`Lo conozco al down este, es ${interaction.user.username}, esta aca desde ${interaction.guild?.joinedAt}. Desde el mesozoico mas o menos.`);
	},
};