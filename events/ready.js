const { Events } = require('discord.js');
const voiceTracker = require('../utils/voiceTracker');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ ${client.user.tag} online!`);
        const totalUsersTracked = voiceTracker.syncWithDiscord(client);
        
    }
};
