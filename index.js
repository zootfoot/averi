const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const token = process.env.TOKEN;
const defaultRole = process.env.DEFAULT_ROLE;
const defaultColor = process.env.DEFAULT_COLOR;
const guildId = process.env.GUILD_ID;
const applicationId = process.env.APPLICATION_ID;

client.once('ready', () => {
    console.log('online!');
});

client.on('guildMemberAdd', async member => {
    const roleId = defaultRole;
    const roleColor = defaultColor;
    const defaultRole = member.guild.roles.cache.get(roleId);

    if (defaultRole) {
        await member.roles.add(defaultRole);
    }

    if (member.roles.cache.size === 2) { 
        const personalRole = await member.guild.roles.create({
            name: member.user.username,
            color: roleColor,
            hoist: false,
            position: member.guild.roles.cache.size - 1
        });

        await member.roles.add(personalRole);
    } else {
        const topRole = member.roles.highest;

        if (topRole.id !== roleId) {
            await topRole.setColor(roleColor);
            await topRole.setName(member.user.username);
            await topRole.setHoist(false);
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'role') {
        const newName = options.getString('name');
        let newColor = options.getString('color');

        if (newColor && !newColor.startsWith('#')) {
            newColor = `#${newColor}`;
        }

        const member = interaction.member;
        const topRole = member.roles.highest;

        if (topRole.id !== defaultRole) {
            if (newName) {
                await topRole.setName(newName);
            }
            if (newColor) {
                await topRole.setColor(newColor);
            }
        }

        await interaction.reply({ content: 'OKA :3', ephemeral: true });
    }
});

client.login(token);

const commands = [
    new SlashCommandBuilder()
        .setName('role')
        .setDescription('update your personal role')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('new name')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('new color (hex)') 
                .setRequired(false))
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('started refreshing application commands');

        await rest.put(
            Routes.applicationGuildCommands(applicationId, guildId),
            { body: commands }
        );

        console.log('successfully reloaded application commands');
    } catch (error) {
        console.error(error);
    }
})();
