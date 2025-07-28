import path from 'node:path';
import { CONSTANS, PLAY_MESSAGES } from '../../constans';
import { searchSongByName } from '../../utils/localHandler';
import { AudioPlayer, createAudioResource, joinVoiceChannel } from '@discordjs/voice';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction, GuildMember, TextChannel } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('local')
    .setDescription('Dame un nombre y busco la cancion dentro de mis descargas para reproducirla.')
    .addStringOption((option) => {
      return option.setName("nombre").setDescription("Nombre de la cancion a buscar (puede ser parcial)").setRequired(true)
    }),
  async execute(interaction: ChatInputCommandInteraction<CacheType>, player: AudioPlayer) {
    const member = interaction.member as GuildMember;
    if (!member.voice.channel) {
      interaction.reply("Metete en un channel de voz down, sino como escuchas???????");
      return;
    }
    const voiceChannel = member.voice.channel;
    
    const foundSong = searchSongByName(interaction.options.getString("nombre")!);
    const songPath = path.join(CONSTANS.MUSIC_DIR, foundSong);
    if(!songPath) {
      interaction.reply("No hay ninguna cancion con un nombre como ese. Aprende a escribir pa");
      return;
    }
    try {
      if(!interaction.channel) return;
      const channel = interaction.channel as TextChannel;

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
      // const queueContruct: Queue = {
      //   textChannel: message.channel,
      //   voiceChannel: voiceChannel,
      //   connection: connection,
      //   songs: [],
      //   player: player,
      //   playing: true
      // };
      // queue.set(message.guild?.id!, queueContruct);
      
      const resource = createAudioResource(songPath);
      console.log(songPath);
      player.play(resource);
      connection.subscribe(player);
  
      const replyMessage = PLAY_MESSAGES[Math.floor(Math.random() * PLAY_MESSAGES.length)];
  
      interaction.reply(`${replyMessage} ** ${songPath.slice(songPath.lastIndexOf("/") + 1, songPath.lastIndexOf("."))} **`);
  
      player.on("error", (error: any) => {
        console.log(error)
        channel.send('Ocurrió un error al reproducir la canción');
        connection.destroy();
      });
  
    } catch (error) {
      console.log(error)
      interaction.reply('Ocurrió un error al reproducir la música local pa!');
    }
  }
};