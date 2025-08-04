import { Collection, SlashCommandBuilder } from 'discord.js';
import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { Channel, VoiceBasedChannel } from "discord.js";

export type Command = {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction, activePlayer?: Map<string, Queue>) => Promise<void>;
};

export interface ActivePlayer {
  textChannel: Channel;
  voiceChannel: VoiceBasedChannel;
  connection?: VoiceConnection;
  queue: Song[];
  player: AudioPlayer;
  playing: boolean;
}

export interface Song {
  title: string;
  url: string;
  local: boolean
}