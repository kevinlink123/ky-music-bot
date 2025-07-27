import { Command } from 'commander';
import { config } from "dotenv";
import { REST, Routes } from 'discord.js';
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

program.parse(process.argv);