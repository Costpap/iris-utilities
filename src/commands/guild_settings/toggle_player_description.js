'use strict';

//#region local dependencies
const { CustomRichEmbed } = require('../../libs/CustomRichEmbed.js');
const { DisBotCommander, DisBotCommand } = require('../../libs/DisBotCommander.js');
//#endregion local dependencies

module.exports = new DisBotCommand({
    name:'TOGGLE_PLAYER_DESCRIPTION',
    category:`${DisBotCommander.categories.GUILD_SETTINGS}`,
    description:'toggles player description',
    aliases:['toggle_player_description'],
    access_level:DisBotCommand.access_levels.GUILD_ADMIN,
    async executor(Discord, client, message, opts={}) {
        const { guild_config_manipulator } = opts;
        const guild_config = guild_config_manipulator.config;
        const player_description = guild_config.player_description === 'enabled';
        if (player_description === true) {
            message.channel.send(new CustomRichEmbed({
                title:`Player Description: disabled;`,
                description:`Youtube player descriptions will not be expanded by default.`
            }, message));
            guild_config_manipulator.modifyConfig({
                player_description:'disabled'
            });
        } else {
            message.channel.send(new CustomRichEmbed({
                title:`Player Description: enabled;`,
                description:`Youtube player descriptions will be expanded by default.`
            }, message));
            guild_config_manipulator.modifyConfig({
                player_description:'enabled'
            });
        }
    },
});