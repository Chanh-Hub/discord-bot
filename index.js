require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder
} = require("discord.js");

const LOG_CHANNEL_ID = "1519695706942869565";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once("ready", () => {
    console.log(`✅ Bot đã online: ${client.user.tag}`);
});

client.on("messageDelete", async (message) => {
    if (!message.guild) return;
    if (message.author?.bot) return;

    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle("🗑️ Tin nhắn đã bị xóa")
        .addFields(
            {
                name: "👤 Người gửi",
                value: `${message.member?.displayName || message.author.username}\n${message.author}`,
                inline: true
            },
            {
                name: "📍 Kênh",
                value: `${message.channel}`,
                inline: true
            },
            {
                name: "📝 Nội dung",
                value: message.content || "*Không có nội dung*"
            }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});

client.login(process.env.TOKEN);

client.on("messageUpdate", async (oldMessage, newMessage) => {
    if (!oldMessage.guild) return;
    if (oldMessage.author?.bot) return;

    if (oldMessage.content === newMessage.content) return;

    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle("✏️ Tin nhắn đã được chỉnh sửa")
        .addFields(
            {
                name: "👤 Người gửi",
                value: `${oldMessage.author}`,
                inline: true
            },
            {
                name: "📍 Kênh",
                value: `${oldMessage.channel}`,
                inline: true
            },
            {
                name: "📝 Nội dung cũ",
                value: oldMessage.content || "*Không có nội dung*"
            },
            {
                name: "📝 Nội dung mới",
                value: newMessage.content || "*Không có nội dung*"
            }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});

client.on("guildMemberAdd", async (member) => {

    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle("📥 Thành viên tham gia")
        .setDescription(`${member} đã tham gia máy chủ.`)
        .addFields(
            {
                name: "👤 Tên hiển thị",
                value: member.displayName
            },
            {
                name: "🆔 ID",
                value: member.id
            }
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});

client.on("guildMemberRemove", async (member) => {

    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle("📤 Thành viên rời máy chủ")
        .setDescription(`${member.user.tag} đã rời máy chủ.`)
        .addFields(
            {
                name: "🆔 ID",
                value: member.id
            }
        )
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});

client.login(process.env.TOKEN);

const { AuditLogEvent } = require("discord.js");

client.on("guildBanAdd", async (ban) => {

    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const logs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd
    });

    const entry = logs.entries.first();

    const embed = new EmbedBuilder()
        .setTitle("🔨 Thành viên bị cấm")
        .addFields(
            {
                name: "👤 Người bị cấm",
                value: `${ban.user}`
            },
            {
                name: "🛡️ Người thực hiện",
                value: entry?.executor
                    ? `${entry.executor}`
                    : "Không xác định"
            }
        )
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});

client.on("guildBanRemove", async (ban) => {
    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle("🔓 Thành viên được gỡ cấm")
        .setDescription(`${ban.user} đã được gỡ cấm.`)
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});

client.on("voiceStateUpdate", async (oldState, newState) => {
    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const member = newState.member || oldState.member;

    if (!oldState.channel && newState.channel) {
        const embed = new EmbedBuilder()
            .setTitle("🎤 Tham gia kênh thoại")
            .setDescription(`${member} đã tham gia ${newState.channel}`)
            .setTimestamp();

        return logChannel.send({ embeds: [embed] });
    }

    if (oldState.channel && !newState.channel) {
        const embed = new EmbedBuilder()
            .setTitle("📤 Rời kênh thoại")
            .setDescription(`${member} đã rời ${oldState.channel}`)
            .setTimestamp();

        return logChannel.send({ embeds: [embed] });
    }

    if (
        oldState.channel &&
        newState.channel &&
        oldState.channel.id !== newState.channel.id
    ) {
        const embed = new EmbedBuilder()
            .setTitle("🔄 Chuyển kênh thoại")
            .setDescription(
                `${member} chuyển từ ${oldState.channel} ➜ ${newState.channel}`
            )
            .setTimestamp();

        return logChannel.send({ embeds: [embed] });
    }
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {

    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const oldRoles = oldMember.roles.cache;
    const newRoles = newMember.roles.cache;

    const addedRoles = newRoles.filter(r => !oldRoles.has(r.id));
    const removedRoles = oldRoles.filter(r => !newRoles.has(r.id));

    if (addedRoles.size > 0) {
        addedRoles.forEach(role => {
            const embed = new EmbedBuilder()
                .setTitle("➕ Vai trò được thêm")
                .setDescription(
                    `${newMember} đã được thêm role ${role}`
                )
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        });
    }

    if (removedRoles.size > 0) {
        removedRoles.forEach(role => {
            const embed = new EmbedBuilder()
                .setTitle("➖ Vai trò bị xóa")
                .setDescription(
                    `${newMember} đã bị gỡ role ${role}`
                )
                .setTimestamp();

            logChannel.send({ embeds: [embed] });
        });
    }
});

client.on("channelCreate", async (channel) => {

    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle("📁 Kênh được tạo")
        .setDescription(`Đã tạo kênh ${channel}`)
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});

client.on("channelDelete", async (channel) => {

    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle("🗑️ Kênh bị xóa")
        .setDescription(`Đã xóa kênh **${channel.name}**`)
        .setTimestamp();

    logChannel.send({ embeds: [embed] });
});

client.on("guildMemberRemove", async (member) => {

    const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
    if (!logChannel) return;

    const logs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberKick
    });

    const entry = logs.entries.first();

    if (
        entry &&
        entry.target.id === member.id &&
        Date.now() - entry.createdTimestamp < 5000
    ) {

        const embed = new EmbedBuilder()

            .setTitle("👢 Thành viên bị đuổi")
            .addFields(
                {
                    name: "👤 Người bị đuổi",
                    value: `${member.user}`
                },
                {
                    name: "🛡️ Người thực hiện",
                    value: `${entry.executor}`
                }
            )
            .setTimestamp();

        logChannel.send({ embeds: [embed] });
    }
});
