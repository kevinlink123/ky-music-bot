import {  PLAY_MESSAGES } from '../../constans';
import { isMusicInFolder, searchSongByName } from '../../utils/localHandler';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { ActivePlayer } from '../../services/ActivePlayer';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('local')
    .setDescription('Dame un nombre y busco la cancion dentro de mis descargas para reproducirla.')
    .addStringOption((option) => {
      return option.setName("nombre").setDescription("Nombre de la cancion a buscar (puede ser parcial)").setRequired(true)
    }),

  async execute(interaction: ChatInputCommandInteraction<CacheType>, activePlayers: Map<string, ActivePlayer>) {
    const member = interaction.member as GuildMember;
    if (!member.voice.channel) {
      interaction.reply("Metete en un channel de voz down, sino como escuchas???????");
      return;
    }
    const currentVoiceChannel = member.voice.channel;
    
    if(!isMusicInFolder(interaction.guildId!)) {
      interaction.reply("Che retardadin no descargaste nada todavia, te cuesta no? Usa el comando **/update** pa descargar algo");
      return;
    }

    const foundSongPath = searchSongByName(interaction.options.getString("nombre")!, interaction.guildId!);
    if(!foundSongPath) {
      interaction.reply("No hay ninguna cancion con un nombre como ese. Aprende a escribir pa");
      return;
    }
    try {
      if(!interaction.channel) return;
      const textChannel = interaction.channel as TextChannel;

      if (!activePlayers.get(interaction.guildId!)) {
        //TODO: Agregar el array de canciones (strings con el pathname) al queue
        const currentActivePlayer = new ActivePlayer(interaction.guildId!, textChannel, currentVoiceChannel);
        activePlayers.set(interaction.guildId!, currentActivePlayer);
      }

      const currentActivePlayer = activePlayers.get(interaction.guildId!)!

      if(currentActivePlayer.getVoiceChannelId() !== currentVoiceChannel.id) {
        currentActivePlayer.setNewConnection(currentVoiceChannel);
      }

      currentActivePlayer.playSong(foundSongPath);
      
      const replyMessage = PLAY_MESSAGES[Math.floor(Math.random() * PLAY_MESSAGES.length)];
      interaction.reply(`${replyMessage} ** ${foundSongPath.slice(foundSongPath.lastIndexOf("/") + 1, foundSongPath.lastIndexOf("."))} **`);

      // player.on("stateChange", (oldState, newState) => {
      //   console.log("OLD STATE: ", oldState.status);
      //   console.log("NEW STATE: ", newState.status);
      //   if (newState.status === "idle") {
      //     currentActivePlayer.player.play(createAudioResource(searchSongByName("a pelo", currentActivePlayer.voiceChannel.guildId!)));
      //   }
      // })
  
    } catch (error) {
      console.log(error)
      interaction.reply('Ocurrió un error al reproducir la música local pa!');
    }
  }
};