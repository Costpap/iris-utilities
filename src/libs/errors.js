'use strict';

const moment = require('moment-timezone');

const bot_config = require('../../config.js');

const { pseudoUniqueId } = require('../utilities.js');

const { client } = require('./bot.js');
const { generateInviteToGuild } = require('./invites.js');
const { CustomRichEmbed } = require('./CustomRichEmbed.js');


//---------------------------------------------------------------------------------------------------------------//

const bot_common_name = bot_config.COMMON_NAME;
const bot_support_guild_id = process.env.BOT_SUPPORT_GUILD_ID;
const bot_central_errors_channel_id = process.env.BOT_LOGGING_CHANNEL_ERRORS_ID;

//---------------------------------------------------------------------------------------------------------------//

const fallback_user_error = new Error('Something went horribly wrong! There is no error information!');
async function logUserError(message, error=fallback_user_error) {
    const error_id = pseudoUniqueId();
    const error_timestamp = moment();
    const bot_support_guild_invite = await generateInviteToGuild(bot_support_guild_id, 'Generated by: logUserError').catch(console.trace);
    const error_embed = new CustomRichEmbed({
        color: 0xFF0000,
        author: {
            iconURL: message.author.displayAvatarURL({dynamic: true}),
            name: `@${message.author.tag} (${message.author.id})`,
        },
        title: `An Error Has Occurred With ${bot_common_name}!`,
        description: `If you need assistance, please join the [${bot_common_name} Support Server](${bot_support_guild_invite.url})!`,
        fields: [
            {
                name: 'Guild:',
                value: `${message.guild.name} (${message.guild.id})`
            }, {
                name: 'Channel:',
                value: `#${message.channel.name} (${message.channel.id})`
            }, {
                name: 'User:',
                value: `@${message.author.tag} (${message.author.id})`
            }, {
                name: 'Error Id:',
                value:`${error_id}`
            }, {
                name: 'Timestamp:',
                value: `${error_timestamp}`
            }, {
                name: 'Information:',
                value: `${'```'}\n${error}\n${'```'}`
            },
        ],
    });

    /* output to message.channel */
    message.channel.send(error_embed).catch(console.warn); // Send error to the guild

    /* output to central error logging channel */
    client.channels.cache.get(bot_central_errors_channel_id).send(error_embed).catch(console.trace);  // Send error to central discord log

    /* output to the console */
    console.error('----------------------------------------------------------------------------------------------------------------');
    console.error(`Error In Server ${message.guild.name}`);
    console.error(`Caused by @${message.author.tag} (${message.author.id})`);
    console.error(`Command Used: ${message.cleanContent}`);
    console.trace(error);
    console.error('----------------------------------------------------------------------------------------------------------------');
}

module.exports = {
    logUserError,
};