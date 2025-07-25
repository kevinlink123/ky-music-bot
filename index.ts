require('dotenv').config();
import { type APIUser } from 'discord-api-types/v10';
import { Innertube } from 'youtubei.js';
import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel ,createAudioPlayer, createAudioResource, entersState, VoiceConnectionStatus, StreamType } from "@discordjs/voice";
const ytdl = require('ytdl-core');
const yts = require('yt-search');
const fs = require('fs');
const path = require('path');
const { join } = require('node:path');

const client = new Client({
  intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

// Variable global para YouTube
let youtube;
let activePlayers = new Map();

// Inicializar YouTube.js al iniciar el bot
async function initializeYoutube() {
  youtube = await Innertube.create({
    lang: 'es',
    location: 'ES',
    retrieve_player: true
  });
  console.log('YouTube.js inicializado correctamente');
}
const player = createAudioPlayer();

//TODO: AGREGAR TIPO MOGOLICO!
const queue = new Map();

client.once('ready', async () => {
  console.log(`Bot conectado como ${client.user.tag}`);
	await initializeYoutube();
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  const voiceChannel = message.member?.voice?.channel;
  
  if (!voiceChannel) {
    return message.reply('Debes estar en un canal de voz para usar este comando!');
  }

  switch (command) {
    case 'local':
      try {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: voiceChannel.guild.id,
          adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        });
        const resource = createAudioResource(join(__dirname, '/music/falopa y cristal.mp3'));
        player.play(resource);
        message.reply('Reproduciendo "falopa y cristal"');

      } catch (error) {
        console.log(error)
        message.reply('Ocurrió un error al reproducir la música local pa!');
      }
      break;

    case 'play':
      if (!args.length) {
        return message.reply('Debes proporcionar un enlace de YouTube o el nombre de una canción!');
      }
      
      try {
        await playYouTubeVideo(voiceChannel, args[0], message);

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

function extractYouTubeId(fullUrl, message) {
	// const fullUrl = "https://www.youtube.com/watch?v=Rao8lCUQRn8&list=PL04E9tY2s7ooVFixdEc0c_Z_caYoddbE2";
	if (fullUrl.includes("youtu.be")) {
		console.log(fullUrl.slice(fullUrl.lastIndexOf("/") + 1));
		return fullUrl.slice(fullUrl.lastIndexOf("/") + 1);

	} else if (fullUrl.includes('watch?v=')) {
		return fullUrl.slice(fullUrl.indexOf("=") + 1, fullUrl.indexOf("&"));

	} else {
		console.log("DAME UN LINK COMO LA GENTE MOGOLICO");
		message.reply("DAME UN LINK COMO LA GENTE MOGOLICO");
	}
}

async function playYoutube(message, voiceChannel, query) {
  //TODO: Agregar tipo de songInfo
	let songInfo;
  
  // Verificar si es un enlace de YouTube

  if (ytdl.validateURL(query)) {
    songInfo = await ytdl.getInfo(query);
		console.log(songInfo);
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

async function playYouTubeVideo(voiceChannel, query, message) {
  if (!voiceChannel) {
    return message.channel.send('Debes estar en un canal de voz para usar este comando!');
  }

  try {
    // Extraer ID si es URL
    const videoId = extractYouTubeId(query, message) || query;

    // Obtener información del video
    const info = await youtube.getInfo(videoId);
		console.log(info);
    
    if (!info || !info.basic_info) {
      return message.channel.send('No se pudo encontrar el video.');
    }

    // Obtener el mejor formato de audio
    const format = info.chooseFormat({
      type: 'audio',
      quality: 'best'
    });

    if (!format) {
      return message.channel.send('No se encontró un formato de audio válido.');
    }

    // Crear conexión de voz
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    // Crear reproductor de audio
		
		const player = createAudioPlayer();
		// const stream = ytdl(song.url, { filter: 'audioonly', quality: 'highestaudio' });
    const resource = createAudioResource(query, {

    });

    player.play(resource);
    connection.subscribe(player);

    // Guardar el reproductor activo
    activePlayers.set(voiceChannel.guild.id, { player, connection });

    // Manejar eventos del reproductor
    player.on('error', error => {
      console.error('Error en el reproductor:', error);
      message.channel.send('Ocurrió un error al reproducir la música.');
    });

    // player.on('idle', () => {
    //   connection.destroy();
    //   activePlayers.delete(voiceChannel.guild.id);
    // });

    return message.channel.send(`APRETEN EL ORTO QUE SUENA: **${info.basic_info.title}**`);

  } catch (error) {
    console.error('Error al reproducir:', error);
    return message.channel.send('Ocurrió un error al intentar reproducir el video.');
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

	//TODO: BUSCAR SOBRE OBSERVATION PATTERS DE DS
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
  
	//TODO: REVISAR PATRONES SETTER & GETTER
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
client.login(process.env.DS_TOKEN);