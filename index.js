const { Client, Intents } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES
  ]
});

const player = createAudioPlayer();
const queue = new Map();

client.once('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  //TODO: Cambiar propiedades opciones por interfaz
  const voiceChannel = message.member?.voice?.channel;
  
  if (!voiceChannel) {
    return message.reply('Debes estar en un canal de voz para usar este comando!');
  }

  switch (command) {
    case 'play':
      if (!args.length) {
        return message.reply('Debes proporcionar un enlace de YouTube o el nombre de una canción!');
      }
      
      try {
        // // Verificar si es un enlace local
        // if (args[0].endsWith('.mp3') || args[0].endsWith('.wav')) {
        //   const filePath = path.join(__dirname, 'music', args[0]);
          
        //   if (!fs.existsSync(filePath)) {
        //     return message.reply('Archivo no encontrado en la carpeta local!');
        //   }
          
        //   playLocalFile(message, voiceChannel, filePath);
        // } else {
        //   // Buscar en YouTube
        //   await playYoutube(message, voiceChannel, args.join(' '));
        // }

        await playYoutube(message, voiceChannel, args.join(' '));

      } catch (error) {
        console.error(error);
        message.reply('Ocurrió un error al reproducir la música!');
      }
      break;
      
    case 'stop':
      stopPlayer(message.guild.id);
      message.reply('Reproducción detenida!');
      break;
      
    case 'skip':
      skipSong(message.guild.id);
      message.reply('Canción saltada!');
      break;
      
    case 'queue':
      showQueue(message.guild.id, message);
      break;
  }
});

async function playYoutube(message, voiceChannel, query) {
  let songInfo;
  
  // Verificar si es un enlace de YouTube
  if (ytdl.validateURL(query)) {
    songInfo = await ytdl.getInfo(query);
  } else {
    // Buscar en YouTube
    const searchResult = await yts(query);
    if (!searchResult.videos.length) {
      return message.reply('No se encontraron resultados!');
    }
    songInfo = await ytdl.getInfo(searchResult.videos[0].url);
  }
  
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
    duration: songInfo.videoDetails.lengthSeconds
  };
  
  const serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      player: player,
      playing: true
    };
    
    queue.set(message.guild.id, queueContruct);
    queueContruct.songs.push(song);
    
    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
      
      queueContruct.connection = connection;
      playSong(message.guild.id, queueContruct.songs[0]);
    } catch (error) {
      console.error(error);
      queue.delete(message.guild.id);
      return message.reply('No pude unirme al canal de voz!');
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`**${song.title}** ha sido añadida a la cola!`);
  }
}

function playLocalFile(message, voiceChannel, filePath) {
  const serverQueue = queue.get(message.guild.id);
  
  const song = {
    title: path.basename(filePath),
    url: filePath,
    duration: 0,
    local: true
  };
  
  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      player: player,
      playing: true
    };
    
    queue.set(message.guild.id, queueContruct);
    queueContruct.songs.push(song);
    
    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
      
      queueContruct.connection = connection;
      playSong(message.guild.id, queueContruct.songs[0]);
    } catch (error) {
      console.error(error);
      queue.delete(message.guild.id);
      return message.reply('No pude unirme al canal de voz!');
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`**${song.title}** ha sido añadida a la cola!`);
  }
}

function playSong(guildId, song) {
  const serverQueue = queue.get(guildId);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guildId);
    return;
  }
  
  let resource;
  
  if (song.local) {
    resource = createAudioResource(song.url);
  } else {
    const stream = ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' });
    resource = createAudioResource(stream);
  }
  
  serverQueue.player.play(resource);
  serverQueue.connection.subscribe(serverQueue.player);
  
  serverQueue.textChannel.send(`Reproduciendo ahora: **${song.title}**`);
  
  serverQueue.player.on('idle', () => {
    serverQueue.songs.shift();
    playSong(guildId, serverQueue.songs[0]);
  });
  
  serverQueue.player.on('error', error => {
    console.error(error);
    serverQueue.textChannel.send('Ocurrió un error al reproducir la canción!');
    serverQueue.songs.shift();
    playSong(guildId, serverQueue.songs[0]);
  });
}

function stopPlayer(guildId) {
  const serverQueue = queue.get(guildId);
  if (!serverQueue) return;
  
  serverQueue.songs = [];
  serverQueue.player.stop();
}

function skipSong(guildId) {
  const serverQueue = queue.get(guildId);
  if (!serverQueue) return;
  
  serverQueue.player.stop();
}

function showQueue(guildId, message) {
  const serverQueue = queue.get(guildId);
  if (!serverQueue || !serverQueue.songs.length) {
    return message.reply('No hay canciones en la cola!');
  }
  
  const queueList = serverQueue.songs.map((song, index) => {
    return `${index + 1}. ${song.title} (${song.local ? 'Archivo local' : song.url})`;
  }).join('\n');
  
  message.channel.send(`**Cola de reproducción:**\n${queueList}`);
}

// Iniciar el bot con tu token
client.login('');