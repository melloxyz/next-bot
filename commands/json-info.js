const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const voiceTracker = require('../utils/voiceTracker');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('json-info')
        .setDescription('Mostra informações sobre o arquivo JSON de status de voz'),

    async execute(interaction) {
        try {
            const jsonFilePath = voiceTracker.getJsonFilePath();
            
            // Verificar se o arquivo existe
            if (!fs.existsSync(jsonFilePath)) {
                const embed = new EmbedBuilder()
                    .setColor('#ffd43b')
                    .setTitle('📄 Arquivo JSON não encontrado')
                    .setDescription('O arquivo `status/voice-status.json` ainda não foi criado. Ele será criado quando alguém entrar em um canal de voz.')
                    .addFields(
                        { name: '📂 Caminho', value: `\`${jsonFilePath}\``, inline: false }
                    )
                    .setTimestamp();

                return interaction.reply({ embeds: [embed] });
            }

            // Ler dados do arquivo
            const data = fs.readFileSync(jsonFilePath, 'utf8');
            const jsonData = JSON.parse(data);
            
            // Calcular tamanho do arquivo
            const stats = fs.statSync(jsonFilePath);
            const fileSizeKB = (stats.size / 1024).toFixed(2);
            
            // Última modificação
            const lastModified = new Date(stats.mtime).toLocaleString('pt-BR');

            const embed = new EmbedBuilder()
                .setColor('#51cf66')
                .setTitle('📄 Informações do Arquivo JSON')
                .setDescription('Arquivo que contém o status atual dos usuários em canais de voz')
                .addFields(
                    { name: '📂 Caminho', value: `\`${jsonFilePath}\``, inline: false },
                    { name: '📊 Total de Usuários', value: `${jsonData.totalConnected || 0}`, inline: true },
                    { name: '💾 Tamanho', value: `${fileSizeKB} KB`, inline: true },
                    { name: '🕐 Última Atualização', value: lastModified, inline: true },
                    { name: '📅 Última Modificação JSON', value: jsonData.lastUpdated || 'N/A', inline: false }
                )
                .setTimestamp();

            // Adicionar preview dos dados se houver usuários conectados
            if (jsonData.connectedUsers && jsonData.connectedUsers.length > 0) {
                const preview = jsonData.connectedUsers
                    .slice(0, 5) // Mostrar apenas os primeiros 5
                    .map(user => `• **${user.username}** em ${user.channelName}`)
                    .join('\n');
                
                const previewText = jsonData.connectedUsers.length > 5 
                    ? `${preview}\n... e mais ${jsonData.connectedUsers.length - 5} usuário(s)`
                    : preview;

                embed.addFields({
                    name: '👥 Preview dos Usuários',
                    value: previewText,
                    inline: false
                });
            }

            // Adicionar exemplo de estrutura JSON
            const exampleStructure = `\`\`\`json
{
  "lastUpdated": "31/07/2025, 15:02:05",
  "totalConnected": 2,
  "connectedUsers": [
    {
      "userId": "123456789",
      "username": "Usuario1",
      "channelId": "987654321",
      "channelName": "Canal Geral"
    }
  ]
}
\`\`\``;

            embed.addFields({
                name: '📋 Estrutura do JSON',
                value: exampleStructure,
                inline: false
            });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Erro ao ler arquivo JSON:', error);
            
            const embed = new EmbedBuilder()
                .setColor('#ff6b6b')
                .setTitle('❌ Erro ao ler arquivo JSON')
                .setDescription('Houve um erro ao tentar ler o arquivo `status/voice-status.json`.')
                .addFields(
                    { name: '📂 Caminho', value: `\`${jsonFilePath}\``, inline: false },
                    { name: '⚠️ Erro', value: `\`${error.message}\``, inline: false }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    }
};
