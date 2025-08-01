const { Events } = require('discord.js');
const voiceTracker = require('../utils/voiceTracker');

module.exports = {
    name: Events.VoiceStateUpdate,
    once: false,
    execute(oldState, newState) {
        // Ignorar outros bots  
        if (newState.member.user.bot) return;

        // Verificar se deve monitorar canais específicos
        const targetChannels = process.env.VOICE_CHANNELS_TO_MONITOR;
        let shouldMonitor = true;

        if (targetChannels) {
            const channelIds = targetChannels.split(',').map(id => id.trim());
            const oldChannelId = oldState.channel?.id;
            const newChannelId = newState.channel?.id;
            
            // Monitorar apenas se o usuário estiver entrando/saindo/mudando de um canal configurado
            shouldMonitor = channelIds.includes(oldChannelId) || channelIds.includes(newChannelId);
        }

        if (!shouldMonitor) return;

        const user = newState.member.user;
        const userId = user.id;
        const username = user.username;
        
        // Usuário entrou em um canal de voz (monitorado)
        if (!oldState.channel && newState.channel) {
            if (!targetChannels || targetChannels.split(',').map(id => id.trim()).includes(newState.channel.id)) {
                voiceTracker.joinChannel(userId, newState.channel.id, username, newState.channel.name);
            }
        }
        
        // Usuário saiu de um canal de voz (monitorado)
        if (oldState.channel && !newState.channel) {
            if (!targetChannels || targetChannels.split(',').map(id => id.trim()).includes(oldState.channel.id)) {
                voiceTracker.leaveChannel(userId);
            }
        }
        
        // Usuário mudou de canal
        if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
            const channelIds = targetChannels ? targetChannels.split(',').map(id => id.trim()) : [];
            const wasInMonitored = !targetChannels || channelIds.includes(oldState.channel.id);
            const isInMonitored = !targetChannels || channelIds.includes(newState.channel.id);

            if (wasInMonitored && !isInMonitored) {
                // Saiu de um canal monitorado para um não monitorado
                voiceTracker.leaveChannel(userId);
            } else if (!wasInMonitored && isInMonitored) {
                // Entrou de um canal não monitorado para um monitorado
                voiceTracker.joinChannel(userId, newState.channel.id, username, newState.channel.name);
            } else if (wasInMonitored && isInMonitored) {
                // Mudou entre canais monitorados
                voiceTracker.switchChannel(userId, newState.channel.id, username, newState.channel.name);
            }
        }
    }
};
