import { getRandomSong, isMusicInFolder, togglePlayState } from '../../utils/localHandler';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { PLAY_MESSAGES } from '../../constans';
import { ActivePlayer } from '../../services/ActivePlayer';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('Reproduce una cancion aleatoria del directorio descargado disponible'),
  async execute(interaction: ChatInputCommandInteraction<CacheType>, activePlayers: Map<string, ActivePlayer>) {
    const member = interaction.member as GuildMember;
    if (!member.voice.channel) {
      interaction.reply("Metete en un channel de voz down, sino como escuchas???????");
      return;
    }
    
    if(!isMusicInFolder(interaction.guildId!)) {
      interaction.reply("Che retardadin no descargaste nada todavia, te cuesta no? Usa el comando **/update** pa descargar algo");
      return;
    }

    const foundSongPath = getRandomSong(interaction.guildId!);
    if(!foundSongPath) {
      interaction.reply("No hay ninguna cancion con un nombre como ese. Aprende a escribir pa");
      return;
    }

    try {
      const currentVoiceChannel = member.voice.channel;
      
      if(!interaction.channel) return;
      const textChannel = interaction.channel as TextChannel;

      // Chequeo si ya existe un player reproduciendo musica en el server. Si no existe, crea uno nuevo
      if (!activePlayers.get(interaction.guildId!)) {
        const currentActivePlayer = new ActivePlayer(interaction.guildId!, textChannel, currentVoiceChannel);
        activePlayers.set(interaction.guildId!, currentActivePlayer);
      }

      const currentActivePlayer = activePlayers.get(interaction.guildId!)!;

      if(currentActivePlayer.getVoiceChannelId() !== currentVoiceChannel.id) {
        currentActivePlayer.setNewConnection(currentVoiceChannel);
      }
      
      currentActivePlayer.playSong(foundSongPath)
  
      const replyMessage = PLAY_MESSAGES[Math.floor(Math.random() * PLAY_MESSAGES.length)];
      interaction.reply(`${replyMessage} ** ${foundSongPath.slice(foundSongPath.lastIndexOf("/") + 1, foundSongPath.lastIndexOf("."))} **`);
  
    } catch (error) {
      console.log(error)
      interaction.reply('Ocurrió un error al reproducir la música local pa!');
    }
  }
};