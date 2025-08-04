import { Song } from "../types";
import { AudioPlayer, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { TextChannel, VoiceBasedChannel } from "discord.js";

export class ActivePlayer {
  guildId: string;
  private textChannel: TextChannel;
  //@ts-ignore
  private voiceChannel: VoiceBasedChannel;
  private connection: VoiceConnection;
  private queue: Song[];
  private player: AudioPlayer;
  playing: boolean = false;
  currentTrackIndex: number = 0;

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
    this.currentTrackIndex = this.queue.findIndex(song => {
      return song.url === songPath
    });
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
    this.currentTrackIndex = 0;
  }

  showQueue() {
    this.textChannel.send("Las canciones en cola:");
    const queueMsg = this.queue.map(song => {
      return song.title;
    })
    this.textChannel.send(queueMsg.join("\n"));
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

    this.player.on("stateChange", (_, newState) => {
      if (newState.status === "idle") {
        const nextSong = this.queue[this.currentTrackIndex + 1];
        this.playSong(nextSong.url);
      }
    })
  }
}