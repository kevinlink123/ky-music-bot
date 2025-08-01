import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skipea a la siguiente cancion'),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.reply("Comando en desarrollo...");
  }
};