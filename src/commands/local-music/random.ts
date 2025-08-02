import { getRandomSong, isMusicInFolder, togglePlayState } from '../../utils/localHandler';
import { ActivePlayer } from '../../types';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice';
import { PLAY_MESSAGES } from '../../constans';

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
      const voiceChannel = member.voice.channel;
      
      if(!interaction.channel) return;
      const textChannel = interaction.channel as TextChannel;

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      if (!activePlayers.get(interaction.guildId!)) {
        const player = createAudioPlayer();

        const queueContruct: ActivePlayer = {
          textChannel: textChannel,
          voiceChannel: voiceChannel,
          connection: connection,
          queue: [],
          player: player,
          playing: false
        };
        
        activePlayers.set(interaction.guildId!, queueContruct);
      }

      const { player } = activePlayers.get(interaction.guildId!)!;
      togglePlayState(activePlayers.get(interaction.guildId!)!);
      
      const resource = createAudioResource(foundSongPath);
      player.play(resource);
      connection.subscribe(player);
  
      const replyMessage = PLAY_MESSAGES[Math.floor(Math.random() * PLAY_MESSAGES.length)];
  
      interaction.reply(`${replyMessage} ** ${foundSongPath.slice(foundSongPath.lastIndexOf("/") + 1, foundSongPath.lastIndexOf("."))} **`);
  
      player.on("error", (error: any) => {
        console.log(error)
        textChannel.send('Ocurrió un error al reproducir la canción');
        connection.destroy();
      });
  
    } catch (error) {
      console.log(error)
      interaction.reply('Ocurrió un error al reproducir la música local pa!');
    }
  }
};