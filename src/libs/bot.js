'use strict';

const Discord = require('discord.js');

const { GuildConfigsManager } = require('./GuildConfig.js');

//---------------------------------------------------------------------------------------------------------------//

const client = new Discord.Client({
    disableMentions: 'everyone',
    partials: [
        'MESSAGE',
        'CHANNEL',
        'REACTION',
    ],
    presence: {
        status: 'online',
        type: 4,
        activity: {
            type: 'PLAYING',
            name: 'Just restarted!',
        },
    },
    messageCacheMaxSize: 50, // keep 50 messages cached in each channel
    messageCacheLifetime: 60 * 5, // messages should be kept for 5 minutes
    messageSweepInterval: 60 * 5, // sweep messages every 5 minutes
});

client.$ = {
    restarting_bot: false,
    lockdown_mode: false,
    guild_lockdowns: new Discord.Collection(),
    dispatchers: new Discord.Collection(),
    queue_managers: new Discord.Collection(),
    volume_managers: new Discord.Collection(),
    audio_controllers: new Discord.Collection(),
    guild_configs_manager: new GuildConfigsManager(process.env.BOT_GUILD_CONFIGS_FILE),
};

console.time(`client.login -> client#ready`);
client.login(process.env.BOT_DISCORD_API_TOKEN);

module.exports = {
    Discord,
    client,
};
