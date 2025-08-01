import { stopPlayer } from '../../utils/localHandler';
import { ActivePlayer } from '../../types';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Detiene la cancion que este sonando'),
  async execute(interaction: ChatInputCommandInteraction<CacheType>, activePlayers: Map<string, ActivePlayer>) {
    const activePlayer = activePlayers.get(interaction.guildId!);
    if(!activePlayer) {
      await interaction.reply("Tomate tus pastillas flaco, no esta sonando nada en ningun lado");
      return;
    }

    try {
      stopPlayer(activePlayer);
    } catch(err) {
      console.error(err)
      interaction.reply('Ocurrió un error al intentar frenar el player!');
    }
    activePlayer.player.stop();
    await interaction.reply("Que lindo el silencio");
  }
};