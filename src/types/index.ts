import { AudioPlayer, VoiceConnection } from "@discordjs/voice";
import { Channel, VoiceBasedChannel } from "discord.js";

export interface Queue {
    textChannel: Channel;
    voiceChannel: VoiceBasedChannel;
    connection?: VoiceConnection;
    songs: Song[];
    player: AudioPlayer;
    playing: boolean;
}

export interface Song {
    title: string;
    url: string;
    duration: number;
    local: boolean
}