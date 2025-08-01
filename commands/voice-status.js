const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const voiceTracker = require('../utils/voiceTracker');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voice-status')
        .setDescription('Gerencia o monitoramento de canais de voz e mostra status dos usuários')
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('Mostra todos os usuários conectados em todos os canais')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('channel')
                .setDescription('Mostra usuários de um canal específico')
                .addChannelOption(option =>
                    option
                        .setName('canal')
                        .setDescription('Canal de voz para verificar')
                        .setRequired(true)
                        .addChannelTypes(2) // GUILD_VOICE
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Mostra status de um usuário específico')
                .addUserOption(option =>
                    option
                        .setName('usuario')
                        .setDescription('Usuário para verificar')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('Mostra configuração atual de monitoramento')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('canais')
                .setDescription('Lista todos os canais de voz do servidor')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('sincronizar')
                .setDescription('Força uma sincronização com os canais do Discord')
        ),

    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'all':
                    await this.handleAllUsers(interaction);
                    break;
                case 'channel':
                    await this.handleChannelUsers(interaction);
                    break;
                case 'user':
                    await this.handleUserStatus(interaction);
                    break;
                case 'config':
                    await this.handleConfig(interaction);
                    break;
                case 'canais':
                    await this.handleCanais(interaction);
                    break;
                case 'sincronizar':
                    await this.handleSincronizar(interaction);
                    break;
                default:
                    await this.handleError(interaction, 'Subcomando não reconhecido.');
            }
        } catch (error) {
            console.error('❌ Erro no comando /voice-status:', error);
            await this.handleError(interaction, 'Ocorreu um erro interno. Tente novamente em alguns instantes.');
        }
    },

    async handleError(interaction, errorMessage) {
        const embed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('⚠️ Erro')
            .setDescription(errorMessage)
            .addFields({
                name: '💡 Sugestões',
                value: '• Tente novamente em alguns instantes\n• Verifique se o comando foi digitado corretamente\n• Entre em contato com a administração se o problema persistir',
                inline: false
            })
            .setFooter({ text: 'Se o erro continuar, reporte para a administração' })
            .setTimestamp();

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (followUpError) {
            console.error('❌ Erro ao enviar mensagem de erro:', followUpError);
        }
    },

    async handleAllUsers(interaction) {
        const connectedUsers = voiceTracker.getConnectedUsers();

        if (connectedUsers.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('📵 Nenhum usuário conectado')
                .setDescription('Não há usuários conectados em canais de voz no momento.')
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        // Agrupar usuários por canal
        const channelGroups = {};
        
        for (const user of connectedUsers) {
            const channelName = user.channelName || 'Canal Desconhecido';
            
            if (!channelGroups[channelName]) {
                channelGroups[channelName] = [];
            }
            
            channelGroups[channelName].push(user);
        }

        const embed = new EmbedBuilder()
            .setColor('#51cf66')
            .setTitle('🔊 Usuários Conectados em Canais de Voz')
            .setDescription(`Total: **${connectedUsers.length}** usuário(s) conectado(s)`)
            .setTimestamp();

        // Adicionar campos para cada canal
        for (const [channelName, users] of Object.entries(channelGroups)) {
            const userList = users
                .map(user => `• **${user.username}** - ${user.timeConnected}`)
                .join('\n');

            embed.addFields({
                name: `🎤 ${channelName} (${users.length})`,
                value: userList,
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleChannelUsers(interaction) {
        const channel = interaction.options.getChannel('canal');
        
        if (!channel.isVoiceBased()) {
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('❌ Erro')
                .setDescription('O canal especificado não é um canal de voz.');

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const usersInChannel = voiceTracker.getUsersInChannel(channel.id);

        if (usersInChannel.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#ffd43b')
                .setTitle('📵 Canal vazio')
                .setDescription(`Não há usuários conectados no canal **${channel.name}**.`)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        const userList = usersInChannel
            .map(user => `• **${user.username}** - ${user.timeConnected}`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor('#51cf66')
            .setTitle(`🎤 ${channel.name}`)
            .setDescription(`**${usersInChannel.length}** usuário(s) conectado(s):\n\n${userList}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleUserStatus(interaction) {
        const user = interaction.options.getUser('usuario');
        const userData = voiceTracker.getUserData(user.id);

        if (!userData) {
            const embed = new EmbedBuilder()
                .setColor('#ffd43b')
                .setTitle('📵 Usuário não conectado')
                .setDescription(`**${user.username}** não está conectado em nenhum canal de voz.`)
                .setTimestamp();

            return interaction.reply({ embeds: [embed] });
        }

        const channel = interaction.guild.channels.cache.get(userData.channelId);
        const channelName = userData.channelName || (channel ? channel.name : 'Canal Desconhecido');

        const embed = new EmbedBuilder()
            .setColor('#51cf66')
            .setTitle(`🔊 Status de ${user.username}`)
            .addFields(
                { name: '🎤 Canal', value: channelName, inline: true },
                { name: '⏱️ Tempo Conectado', value: userData.timeConnected, inline: true },
                { name: '🕐 Entrou às', value: `<t:${Math.floor(userData.joinTime / 1000)}:T>`, inline: true }
            )
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    async handleConfig(interaction) {
        const monitoringInfo = voiceTracker.getMonitoringInfo();
        const connectedUsers = voiceTracker.getConnectedUsers();

        const embed = new EmbedBuilder()
            .setColor('#2ed573')
            .setTitle('📍 Configuração de Monitoramento')
            .setTimestamp();

        if (monitoringInfo.monitoringAll) {
            embed.setDescription('🌐 **Monitorando TODOS os canais de voz do servidor**');
            embed.addFields({
                name: '📊 Estatísticas',
                value: `• **Usuários conectados:** ${connectedUsers.length}\n• **Modo:** Monitoramento global`,
                inline: false
            });
        } else {
            const guild = interaction.guild;
            const channelNames = [];
            
            for (const channelId of monitoringInfo.specificChannels) {
                const channel = guild.channels.cache.get(channelId);
                if (channel) {
                    channelNames.push(`🔊 ${channel.name} (${channel.id})`);
                } else {
                    channelNames.push(`❌ Canal não encontrado (${channelId})`);
                }
            }

            embed.setDescription(`🎯 **Monitorando ${monitoringInfo.totalMonitored} canal(is) específico(s)**`);
            embed.addFields(
                {
                    name: '📋 Canais Monitorados',
                    value: channelNames.length > 0 ? channelNames.join('\n') : 'Nenhum canal configurado',
                    inline: false
                },
                {
                    name: '📊 Estatísticas',
                    value: `• **Usuários conectados:** ${connectedUsers.length}\n• **Canais configurados:** ${monitoringInfo.specificChannels.length}`,
                    inline: false
                }
            );
        }

        embed.addFields({
            name: '⚙️ Como alterar configuração',
            value: '**Para alterar:** Edite a variável `VOICE_CHANNELS_TO_MONITOR` no arquivo `.env`\n**Formato:** IDs separados por vírgula (ex: `123456,789012,345678`)\n**Para monitorar todos:** Deixe a variável vazia',
            inline: false
        });

        await interaction.reply({ embeds: [embed] });
    },

    async handleCanais(interaction) {
        const guild = interaction.guild;
        const voiceChannels = guild.channels.cache.filter(channel => 
            channel.type === ChannelType.GuildVoice
        );

        const embed = new EmbedBuilder()
            .setColor('#5865f2')
            .setTitle('🔊 Canais de Voz do Servidor')
            .setTimestamp();

        if (voiceChannels.size === 0) {
            embed.setDescription('❌ Nenhum canal de voz encontrado neste servidor.');
        } else {
            const channelList = voiceChannels.map(channel => {
                const memberCount = channel.members.size;
                const memberText = memberCount > 0 ? ` (${memberCount} usuário${memberCount !== 1 ? 's' : ''})` : '';
                return `🔊 **${channel.name}**\n📋 ID: \`${channel.id}\`${memberText}`;
            }).join('\n\n');

            embed.setDescription(`📋 **Total:** ${voiceChannels.size} canal(is) de voz\n\n${channelList}`);
            
            embed.addFields({
                name: '💡 Como configurar monitoramento específico',
                value: 'Copie os IDs dos canais desejados e adicione no arquivo `.env`:\n```\nVOICE_CHANNELS_TO_MONITOR=ID1,ID2,ID3\n```',
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    },

    async handleSincronizar(interaction) {
        await interaction.deferReply();

        try {
            const totalUsers = voiceTracker.syncWithDiscord(interaction.client);
            const monitoringInfo = voiceTracker.getMonitoringInfo();

            const embed = new EmbedBuilder()
                .setColor('#2ed573')
                .setTitle('🔄 Sincronização Concluída')
                .setDescription(`✅ **${totalUsers} usuário(s)** foram sincronizados com sucesso!`)
                .addFields({
                    name: '📍 Modo de Monitoramento',
                    value: monitoringInfo.monitoringAll 
                        ? 'Todos os canais de voz' 
                        : `${monitoringInfo.totalMonitored} canais específicos`,
                    inline: true
                })
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Erro na Sincronização')
                .setDescription('Não foi possível sincronizar os dados dos usuários.')
                .setTimestamp();

            await interaction.editReply({ embeds: [errorEmbed] });
        }
    }
};
