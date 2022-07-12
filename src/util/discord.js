import { MessageEmbed, WebhookClient } from "discord.js";
import config from "../../config.json" assert { type: "json" };

const webhookClient = new WebhookClient({ url: config.webhook.client });

const fmtMods = (mods) => (mods?.length ? ` + ${mods.join(", ")}` : "");
const fmtStatus = (status) => {
    return {
        "-1": "NotSubmitted",
        0: "Pending",
        1: "UpdateAvailable",
        2: "Ranked",
        3: "Approved",
        4: "Qualified",
        5: "Loved",
    }[status];
};

export default (score, map, calc) => {
    webhookClient.send({
        username: config.webhook.username,
        avatarURL: config.webhook.avatar,
        embeds: [
            new MessageEmbed()
                .setTitle(
                    `${score.acc.toFixed(2)}% | ${map.title} [${map.version}]` +
                        fmtMods(score.mods)
                )
                .setColor("#34eb6e")
                .setDescription(
                    `**PP:** ${calc.pp.toFixed(2)}pp | **BPM:** ${
                        map.bpm
                    } | **Miss:** ${score.miss} | **OD:** ${
                        score.od
                    } | **Diff:** ${parseFloat(calc.sr).toFixed(
                        2
                    )}*\n\nMap Status: **${fmtStatus(map.status)}**`
                )
                .setImage(
                    `https://assets.ppy.sh/beatmaps/${map.set_id}/covers/cover.jpg`
                ),
        ],
    });
};
