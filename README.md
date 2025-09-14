# 🎯 Next Bot - Monitor de Canais de Voz Discord

Um bot Discord simples e eficiente para monitorar usuários em canais de voz, registrando atividades em um arquivo JSON para sistemas de recompensas baseados em tempo de atividade.

## 📋 Descrição

O **Next Bot** foi desenvolvido para atender à necessidade de um servidor Discord de monitorar quem está ativo nos canais de voz para distribuir recompensas baseadas no tempo conectado. O bot:

- 📊 Monitora usuários em canais de voz em tempo real
- 💾 Salva informações em arquivo JSON (`status/voice-status.json`)
- ⏱️ Calcula tempo de conexão automaticamente
- 🎯 Permite monitoramento de canais específicos ou todos os canais
- 🔄 Sincronização automática quando o bot inicia

## ✨ Funcionalidades Principais

### 🔊 Monitoramento de Voz

- **Detecção automática** quando usuários entram/saem de canais
- **Tracking de tempo** preciso de conexão
- **Exclusão de bots** do monitoramento
- **Suporte a múltiplos servidores**

### 📁 Sistema de Arquivos JSON

- Salva dados automaticamente em `status/voice-status.json`
- Estrutura organizada com informações detalhadas
- Backup e recuperação de dados automática
- Timestamps em formato brasileiro (pt-BR)

### ⚙️ Configuração Flexível

- Monitora todos os canais por padrão
- Opção de monitorar canais específicos via `.env`
- Sincronização manual disponível
- Sistema de logs detalhado

## 🚀 Comandos Disponíveis

### 📢 `/voice-status` - Gerenciamento de Monitoramento

- `all` - Lista todos os usuários conectados
- `channel` - Usuários de um canal específico
- `user` - Status de um usuário específico
- `config` - Mostra configuração atual
- `canais` - Lista canais de voz do servidor
- `sincronizar` - Força sincronização com Discord

### 📄 `/json-info` - Informações do Arquivo

- Mostra estatísticas do arquivo JSON
- Tamanho, última modificação e preview dos dados

### 🤖 `/botinfo` - Informações do Bot

- Estatísticas gerais do bot
- Uso de memória e uptime
- Latência e servidores conectados

### 🏓 `/ping` - Teste de Latência

- Verifica latência do bot e API do Discord

### 🎮 `/connect` - Comandos FiveM (Bonus)

- `servidor` - IP do servidor FiveM
- `conectar` - Guia de conexão
- `status` - Status do servidor
- `comandos` - Lista comandos FiveM
- `solucoes` - Soluções de problemas

## 📦 Instalação e Configuração

### 1. Pré-requisitos

```bash
# Node.js 16+ instalado
node --version

# Git instalado
git --version
```

### 2. Clone o Repositório

```bash
git clone https://github.com/melloxyz/next-bot.git
cd next-bot
```

### 3. Instale as Dependências

```bash
npm install
```

### 4. Configuração do Bot

Crie o arquivo `.env` com base no `.env.example`:

```env
# Token do seu bot Discord
DISCORD_TOKEN=seu_token_aqui

# ID da aplicação Discord
CLIENT_ID=id_do_cliente

# ID do servidor (opcional - para comandos locais)
GUILD_ID=id_do_servidor

# Canais específicos para monitorar (opcional)
# Deixe vazio para monitorar todos os canais
VOICE_CHANNELS_TO_MONITOR=123456789,987654321
```

### 5. Deploy dos Comandos

```bash
node deploy-commands.js
```

### 6. Inicie o Bot

```bash
node index.js
```

## 🏗️ Estrutura do Projeto

```
next-bot/
├── 📁 commands/          # Comandos slash do Discord
│   ├── botinfo.js        # Informações do bot
│   ├── connect.js        # Comandos FiveM
│   ├── json-info.js      # Info do arquivo JSON
│   ├── ping.js           # Teste de latência
│   └── voice-status.js   # Gerenciamento de voz
├── 📁 events/            # Eventos do Discord
│   ├── ready.js          # Bot pronto
│   └── voiceStateUpdate.js # Mudanças de voz
├── 📁 status/            # Arquivos de status
│   └── voice-status.json # Dados dos usuários (gerado automaticamente)
├── 📁 utils/             # Utilitários
│   ├── errorHandler.js   # Tratamento de erros
│   └── voiceTracker.js   # Sistema de tracking
├── deploy-commands.js    # Deploy de comandos
├── index.js             # Arquivo principal
├── package.json         # Dependências
└── .env.example         # Exemplo de configuração
```

## 🔧 Como Funciona o Código

### 📊 Sistema de Tracking (`utils/voiceTracker.js`)

A classe `VoiceTracker` é o coração do sistema:

```javascript
class VoiceTracker {
    constructor() {
        this.userSessions = new Map();  // Armazena sessões ativas
        this.jsonFilePath = path.join(__dirname, '..', 'status', 'voice-status.json');
        this.loadFromFile();  // Carrega dados existentes
    }

    // Principais métodos:
    joinChannel(userId, channelId, username, channelName)  // Usuário entra
    leaveChannel(userId)                                   // Usuário sai
    switchChannel(userId, newChannelId, username, newChannelName) // Muda canal
    saveToFile()                                          // Salva no JSON
    getConnectedUsers()                                   // Lista conectados
}
```

### 🎧 Detecção de Eventos (`events/voiceStateUpdate.js`)

O bot escuta mudanças nos canais de voz:

```javascript
execute(oldState, newState) {
    // Ignora bots
    if (newState.member.user.bot) return;

    // Verifica se deve monitorar o canal
    const targetChannels = process.env.VOICE_CHANNELS_TO_MONITOR;
  
    // Usuário entrou em canal
    if (!oldState.channel && newState.channel) {
        voiceTracker.joinChannel(userId, channelId, username, channelName);
    }
  
    // Usuário saiu do canal
    if (oldState.channel && !newState.channel) {
        voiceTracker.leaveChannel(userId);
    }
  
    // Usuário mudou de canal
    if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
        voiceTracker.switchChannel(userId, newChannelId, username, newChannelName);
    }
}
```

### 💾 Estrutura do JSON

O arquivo `voice-status.json` segue esta estrutura:

```json
{
  "lastUpdated": "14/09/2025 15:30:45",
  "totalConnected": 3,
  "connectedUsers": [
    {
      "userId": "123456789012345678",
      "username": "Usuario1",
      "channelId": "987654321098765432",
      "channelName": "Canal Geral"
    },
    {
      "userId": "234567890123456789",
      "username": "Usuario2", 
      "channelId": "876543210987654321",
      "channelName": "Canal Gaming"
    }
  ]
}
```

### 🎮 Sistema de Comandos

Os comandos usam Discord.js v14 com Slash Commands:

```javascript
// Exemplo de comando
module.exports = {
    data: new SlashCommandBuilder()
        .setName('voice-status')
        .setDescription('Gerencia monitoramento de voz')
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('Lista todos os usuários')
        ),
      
    async execute(interaction) {
        const connectedUsers = voiceTracker.getConnectedUsers();
        // Gera embed com informações...
        await interaction.reply({ embeds: [embed] });
    }
}
```

## 📈 Casos de Uso

### 🎁 Sistema de Recompensas

- Distribute recompensas baseadas em tempo de atividade
- Verifique usuários mais ativos em determinados períodos
- Implemente rankings por tempo conectado

### 📊 Analytics de Servidor

- Monitore picos de atividade nos canais
- Identifique canais mais populares
- Colete dados para relatórios administrativos

### 🎯 Eventos e Atividades

- Verifique participação em eventos
- Monitore atividade durante transmissões
- Organize atividades baseadas em presença

## 🔧 Configurações Avançadas

### Monitoramento Específico

```env
# Monitora apenas canais específicos
VOICE_CHANNELS_TO_MONITOR=123456789,987654321,456789123
```

### Todos os Canais

```env
# Deixe vazio ou comente a linha para monitorar todos
# VOICE_CHANNELS_TO_MONITOR=
```

## 🐛 Solução de Problemas

### Bot Não Responde

- Verifique se o token está correto
- Confirme se o bot tem permissões necessárias
- Execute `node deploy-commands.js` novamente

### JSON Não Atualiza

- Verifique permissões de escrita na pasta `status/`
- Use `/voice-status sincronizar` para forçar atualização
- Verifique logs no console

### Comandos Não Aparecem

- Execute `node deploy-commands.js`
- Aguarde até 1 hora para comandos globais
- Use `GUILD_ID` para comandos instantâneos no servidor

## 🤝 Contribuindo

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🙏 Créditos

Desenvolvido por [melloxyz](https://github.com/melloxyz) para atender às necessidades de monitoramento de atividade em servidores Discord.

---

**💡 Dica:** Use `/voice-status config` para verificar sua configuração atual e `/botinfo` para estatísticas gerais do bot!
