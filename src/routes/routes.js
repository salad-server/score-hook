import consola from "consola";
import config from "../../config.json" assert { type: "json" };
import hook from "../util/discord.js";
import Taiko from "../util/taiko.js";
import { query } from "../util/sql.js";

export const index = (_, res) => {
    res.header("Content-Type", "text/html");
    res.send(`
        <h3>Webhook Profile:</h3>
        <img style="vertical-align: middle;" src="${config.webhook.avatar}" height="70">
        <b>${config.webhook.username}</b>
    `);
};

export const score = async (req, res) => {
    const bmap = parseInt(req.body.bmap) || 0;
    const pp = await new Taiko(
        parseInt(req.body.total_notes),
        parseInt(req.body.miss),
        parseFloat(req.body.od),
        parseFloat(req.body.acc)
    ).fromMap(bmap, req.body.mods);

    const map = await query(`
        SELECT
            set_id, status, title,
            version, bpm
        FROM maps WHERE id = ${bmap}
        LIMIT 1
    `);

    consola.info(`${map[0].title} - [${map[0].version}]`);

    hook(
        {
            acc: req.body.acc,
            mods: req.body.mods,
            miss: req.body.miss,
            od: req.body.od,
        },

        {
            status: map[0].status,
            set_id: map[0].set_id,
            bpm: map[0].bpm,
            title: map[0].title,
            version: map[0].version,
        },

        {
            pp: pp[0],
            sr: pp[1],
        }
    );

    res.header("Content-Type", "application/json");
    res.send(
        JSON.stringify({
            pp: pp[0],
            sr: pp[1],
        })
    );
};
