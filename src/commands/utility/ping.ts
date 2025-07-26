import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { SlashCommandBuilder } from 'discord.js';

const pingCommand = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Contesta con pong para saber si esta vivo el dj"),

    async execute(interaction: ChatInputCommandInteraction<CacheType>) {
        await interaction.reply("pong!");
    },
}

module.exports = pingCommand;