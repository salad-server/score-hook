import config from "./config.json" assert { type: "json" };
import hook from "./util/discord.js";
import Taiko from "./util/taiko.js";

export const index = (_, res) => {
    res.header("Content-Type", "text/html");
    res.send(`
        <h3>Webhook Profile:</h3>
        <img style="vertical-align: middle;" src="${config.webhook.avatar}" height="70">
        <b>${config.webhook.username}</b>
    `);
};

export const score = async (req, res) => {
    const score = new Taiko(
        parseInt(req.body.total_notes),
        parseInt(req.body.miss),
        parseFloat(req.body.od),
        parseFloat(req.body.acc)
    );

    const pp = await score.fromMap(req.body.bmap, req.body.mods);

    hook(
        `PP: ${pp[0]} - ${req.body.bmap} ${req.body.mods}`,
        `${req.body.acc.toFixed(2)}% / ${req.body.miss}x / OD: ${req.body.od}`
    );

    res.header("Content-Type", "application/json");
    res.send(
        JSON.stringify({
            pp: pp[0],
            sr: pp[1],
        })
    );
};
