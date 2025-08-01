const { Client, GatewayIntentBits, Events, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Criar cliente do Discord com as intents necessárias
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Criar coleção para comandos
client.commands = new Collection();

// Carregar comandos da pasta ./commands
const commandsPath = path.join(__dirname, 'commands');

if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`⚠️ Comando em ${file} está faltando "data" ou "execute".`);
        }
    }
    
    console.log(`✅ ${commandFiles.length} comando(s) carregado(s)`);
}

// Carregar eventos da pasta ./events
const eventsPath = path.join(__dirname, 'events');

if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
    
    console.log(`✅ ${eventFiles.length} evento(s) carregado(s)`);
}

// Login do bot
client.login(process.env.DISCORD_TOKEN).then(() => {
    // Log de sucesso será exibido no evento ready.js
}).catch(error => {
    console.error('❌ Erro ao fazer login:', error);
    if (error.code === 'TokenInvalid') {
        console.error('🔑 Token inválido! Verifique se o token no .env está correto.');
    }
    process.exit(1);
});
