const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Mostra a latência do bot'),

    async execute(interaction) {
        try {
            const sent = await interaction.reply({ content: 'Calculando ping...', fetchReply: true });
            const ping = sent.createdTimestamp - interaction.createdTimestamp;
            const apiPing = Math.round(interaction.client.ws.ping);

            const embed = new EmbedBuilder()
                .setColor('#51cf66')
                .setTitle('🏓 Pong!')
                .addFields(
                    { name: '📡 Latência do Bot', value: `${ping}ms`, inline: true },
                    { name: '💫 Latência da API', value: `${apiPing}ms`, inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ content: '', embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro no comando /ping:', error);
            
            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⚠️ Erro')
                .setDescription('Não foi possível calcular a latência.')
                .setTimestamp();

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            } catch (followUpError) {
                console.error('❌ Erro ao enviar mensagem de erro do ping:', followUpError);
            }
        }
    }
};
