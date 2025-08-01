import { ActivePlayer } from '../../types';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Detiene la cancion que este sonando'),
  async execute(interaction: ChatInputCommandInteraction<CacheType>, activePlayer: ActivePlayer) {
    console.log(activePlayer);
    await interaction.reply("Comando en desarrollo...");
  }
};