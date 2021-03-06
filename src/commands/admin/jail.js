'use strict';

//#region local dependencies
const bot_config = require('../../../config.js');

const { Timer } = require('../../utilities.js');

const { CustomRichEmbed } = require('../../libs/CustomRichEmbed.js');
const { logUserError } = require('../../libs/errors.js');
const { DisBotCommander, DisBotCommand } = require('../../libs/DisBotCommander.js');
const { botHasPermissionsInGuild, isThisBot, isThisBotsOwner, isSuperPerson } = require('../../libs/permissions.js');
//#endregion local dependencies

module.exports = new DisBotCommand({
    name:'JAIL',
    category:`${DisBotCommander.categories.HIDDEN}`,
    description:'(un)jails a user in the guild',
    aliases:['jail', 'unjail'],
    access_level:DisBotCommand.access_levels.GUILD_ADMIN,
    async executor(Discord, client, message, opts={}) {
        const { command_prefix, discord_command, command_args } = opts;

        const guild_config = await client.$.guild_configs_manager.fetchConfig(message.guild.id);

        if (!guild_config.beta_programs.includes('JAIL_COMMAND')) {
            message.channel.send(new CustomRichEmbed({
                color: 0xFF00FF,
                description: [
                    'The \`jail\` and \`unjail\` commands are in BETA and only certain Guilds have access to it!',
                    `If you manage this guild and want access, you must contact ${bot_config.COMMON_NAME} Support Staff!`,
                ].join('\n\n'),
            }, message)).catch(console.warn);
            return;
        }

        if (!botHasPermissionsInGuild(message, ['MANAGE_CHANNELS', 'MANAGE_ROLES', 'MUTE_MEMBERS'])) return;

        const member = message.guild.members.resolve(command_args[0]) ?? message.mentions.members.first();

        if (!member) {
            await message.channel.send(new CustomRichEmbed({
                color: 0xFF00FF,
                title: 'Warning!',
                description: 'The \`jail\` and \`unjail\` commands are in BETA!',
            }, message));
            await Timer(1000);
            await message.channel.send(new CustomRichEmbed({
                color: 0xFFFF00,
                title: 'Provide an @user next time!',
                description: 'This command can prevent a specified member from typing or speaking in any channel!',
                fields:[
                    {
                        name: 'Example (putting someone in the jail)',
                        value: `${'```'}\n${command_prefix}jail @user#0001\n${'```'}`
                    }, {
                        name: 'Example (removing someone from the jail)',
                        value: `${'```'}\n${command_prefix}unjail @user#0001\n${'```'}`
                    },
                ],
            }, message));
            return;
        }

        function staffMemberCanJailMember(staff_id, member_id) {
            if (isThisBot(member_id)) return false;
            if (isThisBotsOwner(member_id)) return false;
            if (isSuperPerson(member_id) && !isThisBotsOwner(staff_id)) return false;

            if (staff_id === member_id) return false; // don't allow the staff member to jail themselves

            const staff_member = message.guild.members.resolve(staff_id);
            if (!staff_member) throw new Error('\`staff_id\` must belong to a member in this guild!');

            /* the following people have guaranteed access */
            if (isThisBotsOwner(staff_id)) return true;
            if (isSuperPerson(staff_id)) return true;
            if (message.guild.ownerID === staff_id) return true;

            const staff_member_has_permissions = staff_member.hasPermission('MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'MUTE_MEMBERS');
            if (!staff_member_has_permissions) return false; // they don't have the required permissions

            const member_being_jailed = message.guild.members.resolve(member_id);

            const staff_member_can_jail_member = staff_member.roles.highest.comparePositionTo(member_being_jailed.roles.highest) > 0;
            return staff_member_can_jail_member;
        }

        if (!staffMemberCanJailMember(message.author.id, member.id)) {
            message.channel.send(new CustomRichEmbed({
                color: 0xFFFF00,
                description: `You aren\'t allowed to jail/unjail ${member}!`,
            }, message)).catch(console.warn);
            return;
        }

        if (member.hasPermission(['ADMINISTRATOR'])) {
            message.channel.send(new CustomRichEmbed({
                color: 0xFFFF00,
                description: `This command doesn\'t work on members with the \`ADMINISTRATOR\` permission!`,
            }, message));
            return;
        }

        if (discord_command === `${command_prefix}jail`) {
            const bot_message = await message.channel.send(new CustomRichEmbed({
                description: `Adding ${member} to the jail!`,
            }, message));
            for (const channel of message.guild.channels.cache.values()) {
                /* clone the current permissions before locking the permissions with the parent channel */
                const current_channel_permission_overwrites = Array.from(channel.permissionOverwrites.values());

                try {
                    await channel.overwritePermissions([
                        ...current_channel_permission_overwrites,
                        {
                            id: member.id,
                            deny: [
                                'MANAGE_MESSAGES',
                                'SEND_MESSAGES',
                                'ADD_REACTIONS',
                                'ATTACH_FILES',
                                'EMBED_LINKS',
                                'CONNECT',
                                'SPEAK',
                                'STREAM',
                                'USE_VAD',
                                'MOVE_MEMBERS',
                                'MUTE_MEMBERS',
                                'DEAFEN_MEMBERS',
                            ]
                        }
                    ], `Updated channel permissions to jail @${member.user.tag} (${member.user.id})`);
                } catch (error) {
                    logUserError(message, error);
                    break;
                }

                await Timer(100); // prevent api abuse
            }
            bot_message.edit(new CustomRichEmbed({
                description: `Added ${member} to the jail!`,
            }, message));
        } else { // assuming: discord_command === `${command_prefix}unjail`
            const bot_message = await message.channel.send(new CustomRichEmbed({
                description: `Removing ${member} from the jail!`,
            }, message));
            for (const channel of message.guild.channels.cache.values()) {
                /* clone the current permissions before locking the permissions with the parent channel */
                const current_channel_permission_overwrites = Array.from(channel.permissionOverwrites.values());

                try {
                    await channel.overwritePermissions([
                        ...current_channel_permission_overwrites,
                        {
                            id: member.id,
                        }
                    ], `Updated channel permissions to jail @${member.user.tag} (${member.user.id})`);
                } catch (error) {
                    logUserError(message, error);
                    break;
                }

                await Timer(100); // prevent api abuse
            }
            bot_message.edit(new CustomRichEmbed({
                description: `Removed ${member} from the jail!`,
            }, message));
        }
    },
});
