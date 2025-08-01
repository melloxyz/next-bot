const fs = require('fs');
const path = require('path');

class VoiceTracker {
    constructor() {
        this.userSessions = new Map();
        this.jsonFilePath = path.join(__dirname, '..', 'status', 'voice-status.json');
        this.loadFromFile();
    }

    loadFromFile() {
        try {
            if (fs.existsSync(this.jsonFilePath)) {
                const data = fs.readFileSync(this.jsonFilePath, 'utf8');
                const jsonData = JSON.parse(data);
                
                if (jsonData.connectedUsers && Array.isArray(jsonData.connectedUsers)) {
                    jsonData.connectedUsers.forEach(user => {
                        this.userSessions.set(user.userId, {
                            channelId: user.channelId,
                            joinTime: Date.now(),
                            username: user.username,
                            channelName: user.channelName
                        });
                    });
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar arquivo JSON:', error);
            this.userSessions.clear();
        }
    }

    saveToFile() {
        try {
            const connectedUsers = Array.from(this.userSessions.entries()).map(([userId, data]) => ({
                userId,
                username: data.username,
                channelId: data.channelId,
                channelName: data.channelName
            }));

            const now = new Date();
            const lastUpdated = now.toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const jsonData = {
                lastUpdated: lastUpdated,
                totalConnected: connectedUsers.length,
                connectedUsers
            };

            fs.writeFileSync(this.jsonFilePath, JSON.stringify(jsonData, null, 2), 'utf8');
            
        } catch (error) {
            console.error('❌ Erro ao salvar arquivo JSON:', error);
        }
    }

    joinChannel(userId, channelId, username, channelName) {
        this.userSessions.set(userId, {
            channelId,
            joinTime: Date.now(),
            username,
            channelName
        });
        
        this.saveToFile();
    }

    leaveChannel(userId) {
        this.userSessions.delete(userId);
        this.saveToFile();
    }

    switchChannel(userId, newChannelId, username, newChannelName) {
        this.userSessions.set(userId, {
            channelId: newChannelId,
            joinTime: Date.now(),
            username,
            channelName: newChannelName
        });
        
        this.saveToFile();
    }

    getConnectedUsers() {
        const now = Date.now();
        const users = [];

        this.userSessions.forEach((data, userId) => {
            const timeConnected = now - data.joinTime;
            users.push({
                userId,
                username: data.username,
                channelId: data.channelId,
                channelName: data.channelName,
                joinTime: data.joinTime,
                timeConnected: this.formatTime(timeConnected)
            });
        });

        return users;
    }

    getUsersInChannel(channelId) {
        return this.getConnectedUsers().filter(user => user.channelId === channelId);
    }

    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    isUserConnected(userId) {
        return this.userSessions.has(userId);
    }

    getUserData(userId) {
        if (!this.userSessions.has(userId)) return null;
        
        const data = this.userSessions.get(userId);
        const now = Date.now();
        const timeConnected = now - data.joinTime;

        return {
            userId,
            username: data.username,
            channelId: data.channelId,
            channelName: data.channelName,
            joinTime: data.joinTime,
            timeConnected: this.formatTime(timeConnected)
        };
    }

    getJsonFilePath() {
        return this.jsonFilePath;
    }

    syncWithDiscord(client) {
        this.userSessions.clear();
        
        let totalUsersTracked = 0;
        const targetChannels = process.env.VOICE_CHANNELS_TO_MONITOR;
        const channelIds = targetChannels ? targetChannels.split(',').map(id => id.trim()) : [];
        
        client.guilds.cache.forEach(guild => {
            guild.channels.cache
                .filter(channel => channel.isVoiceBased())
                .forEach(channel => {
                    if (targetChannels && !channelIds.includes(channel.id)) {
                        return;
                    }
                    
                    channel.members.forEach(member => {
                        if (!member.user.bot) {
                            this.joinChannel(member.user.id, channel.id, member.user.username, channel.name);
                            totalUsersTracked++;
                        }
                    });
                });
        });
        
        const monitoringMode = targetChannels ? `${channelIds.length} específicos` : 'todos';
        console.log(`📡 Sincronização: ${totalUsersTracked} usuário(s) | Canais: ${monitoringMode}`);
        
        return totalUsersTracked;
    }

    getMonitoringInfo() {
        const targetChannels = process.env.VOICE_CHANNELS_TO_MONITOR;
        const channelIds = targetChannels ? targetChannels.split(',').map(id => id.trim()) : [];
        
        return {
            monitoringAll: !targetChannels,
            specificChannels: targetChannels ? channelIds : [],
            totalMonitored: targetChannels ? channelIds.length : 'Todos os canais'
        };
    }
}

module.exports = new VoiceTracker();
