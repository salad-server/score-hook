import { MessageEmbed, WebhookClient } from "discord.js";
import config from "../config.json" assert { type: "json" };

const webhookClient = new WebhookClient({ url: config.webhook.client });

export default (title, msg) => {
    const embed = new MessageEmbed().setTitle(title).setColor("#34eb6e").setDescription(msg);

    webhookClient.send({
        username: config.webhook.username,
        avatarURL: config.webhook.avatar,
        embeds: [embed],
    });
};
