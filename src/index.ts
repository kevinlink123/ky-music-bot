require('dotenv').config();
import { CacheType, Client, Collection, Events, GatewayIntentBits, Interaction, MessageFlags } from 'discord.js';
import { Command } from './types';
import { ActivePlayer } from './services/ActivePlayer';
import fs from "fs";
import path from "path";
import { flushMusic } from './utils/localHandler';

class DSClient extends Client {
  commands = new Collection();
}

const client = new DSClient({
  intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command: Command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//TODO: AGREGAR TIPO MOGOLICO!
// VARIABLES GLOBALES
let activePlayers = new Map<string, ActivePlayer>();

client.once('ready', async () => {
  console.log(`Bot conectado como ${client.user?.tag}`);
});

client.on(Events.InteractionCreate, async (interaction: Interaction<CacheType>) => {
  if (!interaction.isChatInputCommand()) return;
  const command = (interaction.client as DSClient).commands.get(interaction.commandName) as Command;

  if(!interaction.inGuild()) {
    await interaction.reply({
      content: "QUE ME MANDAS DM MOGOLICO, DESDE EL SERVER HABLAME NONAS. LARVA",
      flags: MessageFlags.Ephemeral
    });
    return;
  }
  if(!interaction.member) {
    await interaction.reply({
      content: "NO SE QUIEN ME HABLA, ANDATEEEEEE",
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  if (!command) {
    console.error("Que queres?? Pone bien el comando mogolico");
  }

  try {
    await command.execute(interaction, activePlayers);
  } catch(error) {
    console.error(error);
    if(interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "Naaaa fallo la ejecucion del comando", flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
    }
  }
})

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command =  args.shift()?.toLowerCase();

  const voiceChannel = message.member?.voice?.channel;
  
  if (!voiceChannel) {
    return message.reply('Debes estar en un canal de voz para usar este comando!');
  }

  if (!message.guild || !message.guild.id) {
    return message.reply("El server no existe o no esta disponible");
  }

  switch (command) {
    case 'help':
      message.reply("Parece que me toca laburar otra vez.");
      message.channel.send("Yo manejo la musica vieja, tengo varios vinilos (archivos de musica) a mi disposicion (mi entorno local).")
      message.channel.send("Escucho a varios comandos");
      message.channel.send("Todos los comandos empiezan con '!' seguido del comando en si");
      message.channel.send("Para agregar mas canciones, usa el comando **'!update [url]'**. Donde '[url]' es un link de una playlist de youtube. Con esto descargo el audio de los videos y los guardo para poder reproducirlos luego.");
      message.channel.send("Para reproducir una cancion cualquiera usa **'!random'**");
      message.channel.send("Para reproducir alguna cancion en particular usa **'!local [nombre_de_cancion]'**, donde [nombre_de_cancion] es el nombre o nombre parcial por el cual buscare el tema. NOTA: Recuerden que busco canciones por el nombre del archivo.");
      message.channel.send("Para parar la cancion actual usa el comando **'!stop'**");
      message.channel.send("Los comandos **'!play'**, **'!skip'** y **'!queue'** estan disponibles pero siguen en desarrollo")
      message.channel.send("(Consultale al gordo kocho sobre el estado las mismas, yo no tengo idea, no soy de por aca).");
      break;

    case 'flush':
      try {
        flushMusic(message);

      } catch(error) {
        console.error("Error al intentar eliminar la carpeta");
        console.error(error);
      }

      break;
      
    case 'stop':
      stopPlayer(message.guild?.id);
      message.reply('Reproducción detenida!');
      break;
      
    case 'skip':
      skipSong(message.guild?.id);
      message.reply('Canción saltada!');
      break;
      
    case 'queue':
      showQueue(message.guild?.id);
      break;
    
    default:
      message.reply("Escribi bien el comando mogolico");
  }
});

// async function playLocalRandom(message: OmitPartialGroupDMChannel<Message>, voiceChannel: VoiceBasedChannel) {
//   const localSongs = fs.readdirSync(CONSTANS.MUSIC_DIR);
//   const randomSongName = localSongs[Math.floor(Math.random() * (localSongs.length))];
//   const songPath = path.join(CONSTANS.MUSIC_DIR, randomSongName);

//   const connection = joinVoiceChannel({
//     channelId: voiceChannel.id,
//     guildId: voiceChannel.guild.id,
//     adapterCreator: voiceChannel.guild.voiceAdapterCreator,
//   });
//   const queueContruct: ActivePlayer = {
//     textChannel: message.channel,
//     voiceChannel: voiceChannel,
//     connection: connection,
//     queue: [],
//     player: player,
//     playing: true
//   };
//   queue.set(message.guild?.id!, queueContruct);
  
//   const resource = createAudioResource(songPath);
//   player.play(resource);
//   connection.subscribe(player);

//   message.reply(`Reproduciendo ** ${randomSongName} **`);

//   player.on("error", (error: any) => {
//     console.log(error)
//     message.channel.send('Ocurrió un error al reproducir la canción');
//     connection.destroy();
//   });
// }

function stopPlayer(guildId: string = "") {
  const serverQueue = activePlayers.get(guildId);
  if (!serverQueue) return;
  serverQueue.stopPlayer();
}

function skipSong(guildId: string = "") {
  const serverQueue = activePlayers.get(guildId);
  if (!serverQueue) return;
  
  serverQueue.stopPlayer();
}

function showQueue(guildId: string = "") {
  const serverQueue = activePlayers.get(guildId);
  if (!serverQueue) return;

  serverQueue.showQueue();
}

// Iniciar el bot con tu token
client.login(process.env.DS_TOKEN);
