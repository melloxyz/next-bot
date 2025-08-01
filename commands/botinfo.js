const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const voiceTracker = require('../utils/voiceTracker');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Mostra informações sobre o bot'),

    async execute(interaction) {
        try {
            const client = interaction.client;
            const connectedUsers = voiceTracker.getConnectedUsers();
            
            // Calcular o tempo
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor(uptime / 3600) % 24;
            const minutes = Math.floor(uptime / 60) % 60;
            const seconds = Math.floor(uptime % 60);
            
            const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            // Calcular uso de memória
            const memoryUsage = process.memoryUsage();
            const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

            // Obter informações de monitoramento
            const monitoringInfo = voiceTracker.getMonitoringInfo();
            const monitoringText = monitoringInfo.monitoringAll 
                ? 'Todos os canais' 
                : `${monitoringInfo.totalMonitored} específicos`;

            // Criar embed com informações do bot
            const embed = new EmbedBuilder()
                .setColor('#339af0')
                .setTitle('🤖 Informações do Bot')
                .setDescription('NEXT LEVEL BOT')
            .setThumbnail(client.user.displayAvatarURL())
            .addFields(
                { name: '📊 Servidores', value: `${client.guilds.cache.size}`, inline: true },
                { name: '👥 Usuários', value: `${client.users.cache.size}`, inline: true },
                { name: '🔊 Usuários em Voz', value: `${connectedUsers.length}`, inline: true },
                { name: '📍 Canais Monitorados', value: monitoringText, inline: true },
                { name: '⏱️ Uptime', value: uptimeString, inline: true },
                { name: '💾 Uso de Memória', value: `${memoryMB} MB`, inline: true },
                { name: '📡 Latência', value: `${client.ws.ping}ms`, inline: true },
                { name: '🏷️ Versão', value: 'v1.0.0', inline: true },
                { name: '⚙️ Node.js', value: process.version, inline: true },
                { name: '📚 Discord.js', value: 'v14.x', inline: true }
            )
            .setFooter({ text: `ID: ${client.user.id}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro no comando /botinfo:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⚠️ Erro')
                .setDescription('Não foi possível obter informações do bot.')
                .setTimestamp();

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            } catch (followUpError) {
                console.error('❌ Erro ao enviar mensagem de erro do botinfo:', followUpError);
            }
        }
    }
};
