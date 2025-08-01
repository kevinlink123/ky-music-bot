import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flush')
    .setDescription('Elimina todas las canciones descargadas (NO LA USEN CADA DOS POR TRES MOGOLICOS)'),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    await interaction.reply("Comando en desarrollo...");
  }
};