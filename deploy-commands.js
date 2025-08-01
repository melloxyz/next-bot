const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

// Carregar comandos da pasta ./commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`⚠️ Comando em ${file} está faltando "data" ou "execute".`);
    }
}

console.log(`📦 ${commands.length} comando(s) preparado(s) para deploy`);

// Construir e preparar instância da REST API
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy dos comandos
(async () => {
    try {
        console.log(`🚀 Iniciando deploy...`);

        let data;
        
        // Se GUILD_ID estiver definido, registrar comandos apenas no servidor
        if (process.env.GUILD_ID) {
            data = await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`✅ ${data.length} comando(s) registrado(s) no servidor!`);
        } else {
            // Registrar comandos globalmente (demora até 1 hora para aparecer)
            data = await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commands },
            );
            console.log(`✅ ${data.length} comando(s) registrado(s) globalmente!`);
            console.log('⏰ Comandos globais podem demorar até 1 hora para aparecer.');
        }

    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
})();
