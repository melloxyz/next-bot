const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('connect')
        .setDescription('Comandos para ajudar com conexões e informações do FiveM')
        .addSubcommand(subcommand =>
            subcommand
                .setName('servidor')
                .setDescription('Mostra IP do servidor para conectar na cidade')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('conectar')
                .setDescription('Mostra informações para conectar na cidade')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('status')
                .setDescription('Mostra o status do servidor da cidade')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('comandos')
                .setDescription('Lista comandos úteis do FiveM')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('solucoes')
                .setDescription('Soluções para problemas comuns de conexão')
        ),

    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'servidor':
                    await this.handleServidor(interaction);
                    break;
                case 'conectar':
                    await this.handleConectar(interaction);
                    break;
                case 'status':
                    await this.handleStatus(interaction);
                    break;
                case 'comandos':
                    await this.handleComandos(interaction);
                    break;
                case 'solucoes':
                    await this.handleSolucoes(interaction);
                    break;
                default:
                    await this.handleError(interaction, 'Subcomando não reconhecido.');
            }
        } catch (error) {
            console.error('❌ Erro no comando /connect:', error);
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

    async handleServidor(interaction) {
        try {
            // 🔧 CONFIGURAÇÃO DO SERVIDOR
            // Altere as informações abaixo para o seu servidor FiveM:
            const serverIP = "127.0.0.1:30120"; // ← SUBSTITUA pelo IP real do servidor
            const serverName = "Cidade RP";      // ← SUBSTITUA pelo nome da sua cidade
            
            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🌆 Conectar na Cidade')
                .setDescription(`**${serverName}**\nPronto para entrar na cidade? Use as informações abaixo!`)
                .addFields(
                    {
                        name: '🔗 IP do Servidor',
                        value: `\`\`\`${serverIP}\`\`\``,
                        inline: false
                    },
                    {
                        name: '🎮 Como Conectar',
                        value: `**Opção 1 - F8 Console:**\n\`connect ${serverIP}\`\n\n**Opção 2 - Navegador:**\n\`fivem://connect/${serverIP}\`\n\n**Opção 3 - Copiar IP:**\nCopie o IP acima e cole no FiveM`,
                        inline: false
                    },
                    {
                        name: '⚡ Conexão Rápida',
                        value: '• Abra o FiveM\n• Pressione **F8** para abrir o console\n• Digite o comando de conexão\n• Aguarde carregar e divirta-se!',
                        inline: false
                    },
                    {
                        name: '💡 Dica',
                        value: 'Se não conseguir conectar, use `/connect solucoes` para ver soluções de problemas comuns!',
                        inline: false
                    }
                )
                .setFooter({ text: 'Bem-vindo à cidade! 🏙️' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro em handleServidor:', error);
            await this.handleError(interaction, 'Erro ao exibir informações do servidor.');
        }
    },

    async handleConectar(interaction) {
        try {
            const servidor = interaction.options.getString('servidor');
            
            const embed = new EmbedBuilder()
                .setColor('#f1c40f')
                .setTitle('🎮 Como Conectar no FiveM')
                .setDescription('Guia completo para conectar na cidade!')
                .addFields(
                    {
                        name: '📋 Pré-requisitos',
                        value: '• FiveM instalado e atualizado\n• GTA V original (Steam/Epic/Rockstar)\n• Conexão estável com a internet',
                        inline: false
                    },
                    {
                        name: '🔗 Formas de Conectar',
                        value: servidor 
                            ? `**Servidor específico:** \`${servidor}\`\n\n**Pelo F8:**\n\`connect ${servidor}\`\n\n**Pelo navegador:**\n\`fivem://connect/${servidor}\``
                            : '**Pelo F8 (in-game):**\n`connect IP:PORTA`\n\n**Pelo navegador:**\n`fivem://connect/IP:PORTA`\n\n**Pela lista de servidores:**\nF8 → Connect → Buscar servidor',
                        inline: false
                    },
                    {
                        name: '⚙️ Configurações Recomendadas',
                        value: '• Fechar programas desnecessários\n• Modo janela sem bordas (melhor performance)\n• Verificar firewall/antivírus\n• Limpar cache do FiveM se necessário',
                        inline: false
                    },
                    {
                        name: '🚀 Comandos Rápidos',
                        value: '`F8` - Abrir console\n`quit` - Sair do servidor\n`disconnect` - Desconectar\n`reconnect` - Reconectar\n`clear` - Limpar console',
                        inline: false
                    }
                )
                .setFooter({ text: 'Use /connect solucoes para problemas comuns!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro em handleConectar:', error);
            await this.handleError(interaction, 'Erro ao exibir guia de conexão.');
        }
    },

    async handleStatus(interaction) {
        try {
            // 🔧 CONFIGURAÇÃO DO SERVIDOR (mesmo IP da função handleServidor)
            const serverIP = "127.0.0.1:30120"; // ← SUBSTITUA pelo IP real do servidor
            const serverName = "Cidade RP";      // ← SUBSTITUA pelo nome da sua cidade
        
        // Simulação de status (em uma implementação real, você pode fazer uma requisição HTTP para verificar)
        const isOnline = true; // ← Mude para false se quiser simular servidor offline
        const currentPlayers = 45; // ← Número atual de jogadores (pode ser dinâmico)
        const maxPlayers = 64;     // ← Máximo de jogadores do servidor
        
        const statusColor = isOnline ? '#00ff00' : '#ff0000';
        const statusEmoji = isOnline ? '🟢' : '🔴';
        const statusText = isOnline ? 'ONLINE' : 'OFFLINE';
        
        const embed = new EmbedBuilder()
            .setColor(statusColor)
            .setTitle(`${statusEmoji} Status do Servidor`)
            .setDescription(`**${serverName}**`)
            .addFields(
                {
                    name: '� IP do Servidor',
                    value: `\`${serverIP}\``,
                    inline: true
                },
                {
                    name: '📊 Status',
                    value: `**${statusText}**`,
                    inline: true
                },
                {
                    name: '👥 Jogadores',
                    value: isOnline ? `**${currentPlayers}/${maxPlayers}**` : '**0/0**',
                    inline: true
                }
            );

        if (isOnline) {
            embed.addFields(
                {
                    name: '⚡ Como Conectar',
                    value: `**F8 Console:**\n\`connect ${serverIP}\`\n\n**Navegador:**\n\`fivem://connect/${serverIP}\``,
                    inline: false
                },
                {
                    name: '💡 Dica',
                    value: 'Use `/connect servidor` para ver o guia completo de conexão!',
                    inline: false
                }
            );
        } else {
            embed.addFields(
                {
                    name: '⚠️ Servidor Offline',
                    value: 'O servidor está temporariamente indisponível.\nTente novamente em alguns minutos ou entre em contato com a administração.',
                    inline: false
                },
                {
                    name: '� Possíveis Causas',
                    value: '• Manutenção programada\n• Reinicialização do servidor\n• Problemas técnicos temporários\n• Atualização de recursos',
                    inline: false
                }
            );
        }

        embed.setFooter({ text: `Última verificação: ${new Date().toLocaleString('pt-BR')}` })
             .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro em handleStatus:', error);
            await this.handleError(interaction, 'Erro ao verificar status do servidor.');
        }
    },

    async handleComandos(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setColor('#9b59b6')
                .setTitle('⌨️ Comandos Úteis do FiveM')
                .setDescription('Lista completa de comandos para o console F8')
                .addFields(
                    {
                        name: '🔗 Conexão',
                        value: '`connect IP:PORTA` - Conectar ao servidor\n`disconnect` - Desconectar do servidor\n`reconnect` - Reconectar ao último servidor\n`quit` - Sair do FiveM',
                        inline: false
                    },
                    {
                        name: '🛠️ Sistema',
                        value: '`clear` - Limpar console\n`cls` - Limpar console (alternativo)\n`say "mensagem"` - Enviar mensagem no chat\n`me "ação"` - Comando de ação RP',
                        inline: false
                    },
                    {
                        name: '📊 Informações',
                        value: '`netgraph` - Mostrar informações de rede\n`strdbg` - Debug de streaming\n`resmon` - Monitor de recursos\n`txd` - Informações de texturas',
                        inline: false
                    },
                    {
                        name: '🎮 Jogo',
                        value: '`noclip` - Modo noclip (se permitido)\n`coords` - Mostrar coordenadas\n`save` - Salvar posição (alguns servidores)\n`load` - Carregar posição salva',
                        inline: false
                    },
                    {
                        name: '🔧 Correções',
                        value: '`refresh` - Recarregar recursos\n`restart [recurso]` - Reiniciar recurso específico\n`stop [recurso]` - Parar recurso\n`start [recurso]` - Iniciar recurso',
                        inline: false
                    }
                )
                .setFooter({ text: 'Nem todos os comandos funcionam em todos os servidores!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro em handleComandos:', error);
            await this.handleError(interaction, 'Erro ao exibir lista de comandos.');
        }
    },

    async handleSolucoes(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('🔧 Soluções para Problemas Comuns')
                .setDescription('Resolva os problemas mais frequentes do FiveM')
                .addFields(
                    {
                        name: '❌ Não consegue conectar',
                        value: '**Soluções:**\n• Verifique se o FiveM está atualizado\n• Desative antivírus temporariamente\n• Execute como administrador\n• Verifique firewall do Windows\n• Reinicie o roteador',
                        inline: false
                    },
                    {
                        name: '⚠️ Erro de autenticação',
                        value: '**Soluções:**\n• Faça logout/login no Rockstar\n• Limpe cache do FiveM\n• Verifique se o GTA V é original\n• Reinicie o Steam/Epic/Rockstar Launcher',
                        inline: false
                    },
                    {
                        name: '🐌 Lag/Travamentos',
                        value: '**Soluções:**\n• Feche programas em segundo plano\n• Reduza configurações gráficas do GTA V\n• Use modo janela sem bordas\n• Verifique temperatura do PC\n• Atualize drivers da GPU',
                        inline: false
                    },
                    {
                        name: '💾 Limpeza de Cache',
                        value: '**Windows:**\n`%localappdata%\\FiveM\\FiveM.app\\data\\cache`\n\n**Como fazer:**\n• Feche o FiveM completamente\n• Delete a pasta cache\n• Reinicie o FiveM',
                        inline: false
                    },
                    {
                        name: '🔄 Reinstalação Limpa',
                        value: '**Passos:**\n1. Desinstale o FiveM\n2. Delete pasta `%localappdata%\\FiveM`\n3. Baixe nova versão do site oficial\n4. Execute como administrador\n5. Configure novamente',
                        inline: false
                    }
                )
                .setFooter({ text: 'Se os problemas persistirem, entre em contato com suporte do servidor!' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro em handleSolucoes:', error);
            await this.handleError(interaction, 'Erro ao exibir soluções de problemas.');
        }
    }
};
