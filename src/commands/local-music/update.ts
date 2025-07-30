import { downloadFromYTPlaylist, validateUrl } from '../../utils/localHandler';
import { SlashCommandBuilder, CacheType, ChatInputCommandInteraction, TextChannel } from 'discord.js';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Dame una url de playlist de yutun y la descargo en mi server pa')
    .addStringOption((option) => {
      return option.setName("url").setDescription("La url de la playlist a descargar").setRequired(true);
    }),
  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
    try {
      await interaction.deferReply();
      const ytUrl = interaction.options.getString("url");
      if (!ytUrl) throw new Error("La url vino vacia!!!!!");
      
      if (!validateUrl(ytUrl)) {
        await interaction.editReply("Cualquier cosa me das imbecil, DAME UNA URL COMO LA GENTE");
        return;
      }
      if(!interaction.channel) return;
      const channel = interaction.channel as TextChannel;
      channel.send("Ahi me puse a descargar los archivos. Podria tardar un rato...");
      channel.send("Yo aviso por aca cuando termine");

      await downloadFromYTPlaylist(ytUrl, interaction.guildId!);

      channel.send("LISTO PA TODO DESCARGADITO (como la cola de tu mama)");

      await interaction.editReply("TERMINE DE PENSAR");
    } catch(err: any) {
      const { code, message } = err;
      console.error({
        code,
        message
      })
    }
  }
};