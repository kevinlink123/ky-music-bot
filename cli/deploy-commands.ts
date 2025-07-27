import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path'
config();

const commands: { data: any, execute: () => any }[] = [];
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, '..', 'src', 'commands');
console.log(foldersPath);
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
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(process.env.DS_TOKEN!);

// and deploy your commands!
(async () => {
	try {
		const clientId = process.env.CLIENT_ID;
		const guildId = process.env.TEST_SERVER_ID;
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(clientId!, guildId!),
			{ body: commands },
		);

		//@ts-ignore
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
		
	}
})();
