import { Command } from 'commander';
import { config } from "dotenv";
import { REST, Routes } from 'discord.js';
import path from 'node:path';
import fs from 'node:fs';
config();

const program = new Command();
const rest = new REST().setToken(process.env.DS_TOKEN!);

async function deleteCommandById(commandId: string) {
  try {
    await rest.delete(Routes.applicationCommand(process.env.CLIENT_ID!, commandId));
    console.log(`Comando con  id ${commandId} borrado exitosamente!`);
  
  } catch (err: any) {
    const { code, message } = err;
    console.error({
      code,
      message
    });
  }
}

async function deleteAllCommands() {
  //TODO: Por ahora elimina los comandos registrados en el server de testing (los gordos compu). Refactorizar esta funcion para que reciba como parametro el id de un servidor
  try {
    rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.TEST_SERVER_ID!), { body: [] })
    console.log("Todos los comandos registrados fueron eliminados exitosamente!")
  } catch(err: any) {
    const { code, message } = err;
    console.error({
      code,
      message
    });
  }
}

async function deployCommandToServerById(serverId: string) {
  if(!serverId) {
    console.error("TENES QUE DARME EL ID DEL SERVIDOR AL QUE QUIERAS QUE REGISTRE LOS COMANDOS!");
    return
  }

  const commands: { data: any, execute: () => any }[] = [];
  // Grab all the command folders from the commands directory you created earlier
  const foldersPath = path.join(__dirname, '..', 'src', 'commands');
  const commandFolders = fs.readdirSync(foldersPath);
  
  for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    // Notice that here we are looking for .ts files (in the index we search for .js files 'cause after comp all files are .js)
    // This is because we use ts-node to execute scripts 
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command: { data: any, execute: () => any } = require(filePath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
      }
    }
  };

  // Construct and prepare an instance of the REST module
  // const rest = new REST().setToken(process.env.DS_TOKEN!);
  
  // and deploy your commands!
  (async () => {
    try {
      const clientId = process.env.CLIENT_ID;
      console.log(`Started refreshing ${commands.length} application (/) commands.`);
  
      // The put method is used to fully refresh all commands in the guild with the current set
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId!, serverId!),
        { body: commands },
      );
  
      //@ts-ignore
      console.log(`Successfully reloaded ${data.length} application (/) commands to server with id ${serverId}.`);
    } catch (error) {
      // And of course, make sure you catch and log any errors!
      console.error(error);
      
    }
  })();
}

program
  .name("manageCommands")
  .description("Herramienta de control de comandos")
  .version("0.1");

program
  .command("test <someVar>")
  .description("Comando de testeo de funcionamiento del cli")
  .action((someVar: string) => {
    console.log("La funcion se ejecuta bien");
    console.log("El parametro recibido es: ", someVar);
  })

program
  .command('delete:all')
  .description("Elimina todos los comandos registrados del bot. USESE BAJO SU PROPIO RIESGO")
  .action(deleteAllCommands);

program
  .command("delete:id <commandId>")
  .description("Elimina un comando con el command id dado")
  .action(deleteCommandById)

program
  .command('deploy:id <serverId>')
  .description('Registra todos los comandos creados a un server especifico')
  .action(deployCommandToServerById)
program.parse(process.argv);