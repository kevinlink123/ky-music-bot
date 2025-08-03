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
      const currentVoiceChannel = member.voice.channel;
      
      if(!interaction.channel) return;
      const textChannel = interaction.channel as TextChannel;

      // Chequeo si ya existe un player reproduciendo musica en el server. Si no existe, crea uno nuevo
      if (!activePlayers.get(interaction.guildId!)) {
        // El bot entra al canal de voz donde esta el usuario que lo invoca
        const connection = joinVoiceChannel({
          channelId: currentVoiceChannel.id,
          guildId: currentVoiceChannel.guild.id,
          adapterCreator: currentVoiceChannel.guild.voiceAdapterCreator,
        });
        const player = createAudioPlayer();

        // Crea un ActivePlayer que tiene toda la info necesaria para mandar mensajes, escuchar eventos, etc.
        const queueContruct: ActivePlayer = {
          textChannel: textChannel,
          voiceChannel: currentVoiceChannel,
          connection: connection,
          queue: [],
          player: player,
          playing: false
        };
        
        activePlayers.set(interaction.guildId!, queueContruct);
      }
      const currentActivePlayer = activePlayers.get(interaction.guildId!)!;
      const { player, connection, voiceChannel } = currentActivePlayer;

      if(voiceChannel.id !== currentVoiceChannel.id) {
        // Si un usuario invoca al bot desde otro canal de voz, se crea una nueva conexion y se guarda en el ActivePlayer
        const newConnection = joinVoiceChannel({
          channelId: currentVoiceChannel.id,
          guildId: currentVoiceChannel.guild.id,
          adapterCreator: currentVoiceChannel.guild.voiceAdapterCreator,
        });

        currentActivePlayer.connection = newConnection;
      }
      
      if(!connection) throw new Error("ERROR: No existe una conexion!");
      togglePlayState(activePlayers.get(interaction.guildId!)!);
      
      // Se crea el recurso de audio a partir de un path y se carga en el objeto player
      const resource = createAudioResource(foundSongPath);
      player.play(resource);
      // El objeto que representa la conexion al canal de voz escucha eventos del player
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