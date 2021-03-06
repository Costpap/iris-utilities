'use strict';

//#region local dependencies
const { CustomRichEmbed } = require('../../libs/CustomRichEmbed.js');
const { DisBotCommander, DisBotCommand } = require('../../libs/DisBotCommander.js');
//#endregion local dependencies

module.exports = new DisBotCommand({
    name:'ALL_COMMANDS',
    category:`${DisBotCommander.categories.HELP}`,
    weight:2,
    description:'Displays a list of all commands',
    aliases:['all_commands'],
    access_level:DisBotCommand.access_levels.GLOBAL_USER,
    async executor(Discord, client, message, opts={}) {
        const { command_prefix } = opts;

        const command_categories = [
            DisBotCommander.categories.HELP,
            DisBotCommander.categories.INFO,
            DisBotCommander.categories.MUSIC,
            DisBotCommander.categories.FUN,
            DisBotCommander.categories.UTILITIES,
            DisBotCommander.categories.ADMINISTRATOR,
            DisBotCommander.categories.GUILD_SETTINGS,
        ];

        const formatted_command_categories = command_categories.map(category_name => {
            const commands_in_category = DisBotCommander.commands.filter(command => command.category === category_name);

            /**
             * Example Output: [`% | %play | %p | %playnext | %pn`, `%search`]
             */
            const formatted_commands = commands_in_category.map(command => 
                command.aliases.map(command_alias => 
                    `${command_prefix}${command_alias.replace('#{cp}', `${command_prefix}`)}`
                ).join(' | ')
            );

            return {
                category_name: `${category_name}`,
                formatted_commands: formatted_commands,
            };
        });

        const all_commands_fields = formatted_command_categories.map(formatted_command_category => ({
            name: `${formatted_command_category.category_name}`,
            value: `${'```'}\n${formatted_command_category.formatted_commands.join('\n')}\n${'```'}`,
        }));

        message.channel.send(new CustomRichEmbed({
            title: `Here are all of the commands, all at once!`,
            fields: all_commands_fields,
        }, message));
    },
});
