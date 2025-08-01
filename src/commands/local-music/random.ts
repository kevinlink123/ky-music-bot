import { ActivePlayer } from '../../types';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Reproduce una cancion aleatoria del directorio descargado disponible'),
  async execute(interaction: ChatInputCommandInteraction<CacheType>, activePlayer: ActivePlayer) {
    console.log(activePlayer);
    await interaction.reply("Comando en desarrollo...");
  }
};