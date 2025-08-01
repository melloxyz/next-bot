const { EmbedBuilder } = require('discord.js');

class ErrorHandler {
    static async handleCommandError(interaction, errorMessage, error = null) {
        // Log do erro no console
        if (error) {
            console.error(`❌ Erro no comando /${interaction.commandName}:`, error);
        } else {
            console.error(`❌ Erro no comando /${interaction.commandName}:`, errorMessage);
        }

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
            // Verificar se a interação já foi respondida
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        } catch (followUpError) {
            console.error('❌ Erro crítico ao enviar mensagem de erro:', followUpError);
            
            // Tentar resposta de emergência
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({ 
                        content: '❌ Ocorreu um erro interno. Tente novamente.', 
                        ephemeral: true 
                    });
                }
            } catch (emergencyError) {
                console.error('❌ Erro crítico na resposta de emergência:', emergencyError);
            }
        }
    }

    static async handleValidationError(interaction, validationMessage) {
        const embed = new EmbedBuilder()
            .setColor('#ffd43b')
            .setTitle('⚠️ Atenção')
            .setDescription(validationMessage)
            .addFields({
                name: '💡 Dica',
                value: 'Verifique os parâmetros do comando e tente novamente.',
                inline: false
            })
            .setTimestamp();

        try {
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem de validação:', error);
            await this.handleCommandError(interaction, 'Erro de validação.');
        }
    }

    static async handlePermissionError(interaction, permissionMessage = 'Você não tem permissão para usar este comando.') {
        const embed = new EmbedBuilder()
            .setColor('#ff6b6b')
            .setTitle('🚫 Acesso Negado')
            .setDescription(permissionMessage)
            .addFields({
                name: '🔑 Informação',
                value: 'Entre em contato com um administrador se acredita que deveria ter acesso a este comando.',
                inline: false
            })
            .setTimestamp();

        try {
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem de permissão:', error);
        }
    }

    static async executeWithErrorHandling(interaction, commandFunction, errorContext = 'comando') {
        try {
            await commandFunction();
        } catch (error) {
            await this.handleCommandError(
                interaction, 
                `Ocorreu um erro interno no ${errorContext}. Tente novamente em alguns instantes.`,
                error
            );
        }
    }
}

module.exports = ErrorHandler;