import { AudioPlayer, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { TextChannel, VoiceBasedChannel } from "discord.js";

export class ActivePlayer {
  guildId: string;
  private textChannel: TextChannel;
  //@ts-ignore
  private voiceChannel: VoiceBasedChannel;
  private connection: VoiceConnection;
  private queue: string[];
  private player: AudioPlayer;
  playing: boolean = false;

  constructor(guildId: string, textChannel: TextChannel, voiceChannel: VoiceBasedChannel) {
    this.guildId = guildId;
    this.textChannel = textChannel;
    this.voiceChannel = voiceChannel;
    this.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
    this.queue = [];
    this.player = createAudioPlayer();
    this.playing = false;

    this.setupEventListeners();
  }

  playSong(songPath: string) {
    const resource = createAudioResource(songPath);
    this.player.play(resource);
    this.playing = true;
    this.connection.subscribe(this.player);
  }

  stopPlayer() {
    if (!this.playing) {
      this.textChannel.send("Tomate tus pastillas flaco, no esta sonando nada en ningun lado");
      return;
    }
    this.player.stop();
    this.playing = false;
    this.queue = [];
  }
  
  showQueue() {
    this.textChannel.send("Las canciones en cola:");
    this.textChannel.send(this.queue.join("\n"));
  }

  sendMessageToChannel(message: string) {
    this.textChannel.send(message);
  }


  //SETTERS & GETTERS
  getVoiceChannelId() {
    return this.voiceChannel.id;
  }

  setNewConnection(voiceChannel: VoiceBasedChannel) {
    this.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
  }

  setQueue(newQueue: Song[]) {
    this.queue = [...newQueue];
  }

  private setupEventListeners(): void {
    this.player.on('error', error => {
      console.error(`[${this.guildId}] Error en reproductor:`, error);
      this.textChannel.send('Ocurrió un error al reproducir la canción');
      this.connection.destroy();
    });
  }
}