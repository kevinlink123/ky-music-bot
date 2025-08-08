import { CONSTANS } from '../../constans';
import { isMusicInFolder } from '../../utils/localHandler';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction, TextChannel } from 'discord.js';
import path from 'node:path';
import fs from 'node:fs';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flush')
    .setDescription('Elimina todas las canciones descargadas (NO LA USEN CADA DOS POR TRES MOGOLICOS)'),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    if(!interaction.guildId) return;
    const serverMusicFolder = path.join(CONSTANS.MUSIC_DIR, interaction.guildId);
    
    if (!isMusicInFolder(interaction.guildId)) {
      interaction.reply("No me dieron nada para descargar todavia autistas");
      return;
    }
    (interaction.channel as TextChannel).send("YA MISMO ELIMINO TODO LOCO, ME HINCHE LAS PELOTAS");
    fs.rmSync(serverMusicFolder, { recursive: true, force: true });
    await interaction.reply("Ahi termine, todo limpiecito");
  }
};