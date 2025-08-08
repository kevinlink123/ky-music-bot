import { PLAY_MESSAGES } from '../../constans';
import { ActivePlayer } from '../../services/ActivePlayer';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skipea a la siguiente cancion'),
  async execute(interaction: ChatInputCommandInteraction<CacheType>, activePlayers: Map<string, ActivePlayer>) {
    if (!interaction.guildId) return;
    const currentActivePlayer = activePlayers.get(interaction.guildId);
    if (!currentActivePlayer) {
      await interaction.reply("No hay ningun player sonando esquizofrenico");
      return;
    }
    if (!currentActivePlayer.getQueue().length) {
      await interaction.reply("No hay nada en cola, pode a reproducir algo o ME ENOJO LOCO");
      return;
    }

    currentActivePlayer.nextSong();
    const replyMessage = PLAY_MESSAGES[Math.floor(Math.random() * PLAY_MESSAGES.length)];
    await interaction.reply(`${replyMessage} ** ${currentActivePlayer.getCurrentTrack()?.title} **`);
  }
};