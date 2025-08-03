import { ActivePlayer } from '../../services/ActivePlayer';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction, GuildMember } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Muestra las canciones en cola'),
  async execute(interaction: ChatInputCommandInteraction<CacheType>, activePlayers: Map<string, ActivePlayer>) {
    const member = interaction.member as GuildMember;
    if (!member.voice.channel) {
      interaction.reply("Metete en un channel de voz down, sino como escuchas???????");
      return;
    }
    const guildId = interaction.guildId || "";
    const currentActivePlayer = activePlayers.get(guildId);
    if(!currentActivePlayer) {
      interaction.reply("No hay ningun player active mogolico, NO ME ROMPAS LAS BOLAS.");
      return;
    }

    currentActivePlayer.showQueue();
    interaction.reply("ahi tenes la cola (de tu jermu)");
  }
};