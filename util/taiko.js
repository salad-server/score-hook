// sources:
// - https://mon.im/taikopp
// - https://osu.ppy.sh/community/forums/topics/472288
// https://gist.github.com/Cyan903/30be3f21a0c37185083ea92f61c6f8c6

import fetch from "node-fetch";

export default class {
    constructor(hitcount, misses, od, acc) {
        this.hitcount = hitcount;
        this.misses = misses;
        this.od = od;
        this.acc = acc;
    }

    #fixMods(mods = []) {
        // prettier-ignore
        return [...new Set(mods.map((mod) => {
            switch (mod) {
                case "EZ":
                case "HR":
                case "HT":
                case "DT":
                case "HD":
                case "FL":
                case "NF":
                    return mod;
                case "NC":
                    return "DT";
            }

            return false;
        }).filter((mod) => mod))];
    }

    // pp
    #modsOD(od, mods) {
        if (mods.includes("EZ")) {
            od /= 2;
        } else if (mods.includes("HR")) {
            od *= 1.4;
        }

        od = Math.max(Math.min(od, 10), 0);
        return od;
    }

    #timingWindows(od, mods) {
        const [max, min] = [20, 50];
        let result = min + ((max - min) * this.#modsOD(od, mods)) / 10;

        result = Math.floor(result) - 0.5;

        if (mods.includes("HT")) {
            result /= 0.75;
        } else if (mods.includes("DT")) {
            result /= 1.5;
        }

        return Math.round(result * 100) / 100;
    }

    #calculate(strain, mods = []) {
        const combo = this.hitcount - this.misses;
        const OD300 = this.#timingWindows(this.od, mods);
        let good = Math.round(
            (1 - this.misses / this.hitcount - this.acc / 100) *
                2 *
                this.hitcount
        );

        // prettier-ignore
        if (
            strain < 0 || this.hitcount < 0 ||
            this.misses < 0 || combo < 0 ||
            this.acc < 0 || this.acc > 100 ||
            OD300 < 0 || this.misses + good > this.hitcount || good < 0
        ) {
            console.error("something wrong with inputs");
            return;
        }

        // prettier-ignore
        let strainamt = Math.pow(Math.max(1, strain / 0.0075) * 5 - 4, 2) / 100000;
        let len = Math.min(1, this.hitcount / 1500) * 0.1 + 1;

        strainamt *= len;
        strainamt *= Math.pow(0.985, this.misses);
        strainamt *= Math.min(
            Math.pow(combo, 0.5) / Math.pow(this.hitcount, 0.5),
            1
        );
        strainamt *= this.acc / 100;

        let accamt =
            Math.pow(150 / OD300, 1.1) * Math.pow(this.acc / 100, 15) * 22;
        let modamt = 1.1;

        accamt *= Math.min(Math.pow(this.hitcount / 1500, 0.3), 1.15);

        if (mods.includes("HD")) {
            modamt *= 1.1;
            strainamt *= 1.025;
        }

        if (mods.includes("NF")) {
            modamt *= 0.9;
        }

        if (mods.includes("FL")) {
            strainamt *= 1.05 * len;
        }

        return (
            Math.round(
                Math.pow(
                    Math.pow(strainamt, 1.1) + Math.pow(accamt, 1.1),
                    1.0 / 1.1
                ) *
                    modamt *
                    100
            ) / 100
        );
    }

    // sr
    async #getSr(beatmap_id, mod = []) {
        const mods = mod.map((m) => {
            return {
                acronym: m,
            };
        });

        return await fetch("https://osu.ppy.sh/difficulty-rating", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                beatmap_id,
                mods,
                ruleset_id: 1,
            }),
        }).then((t) => t.text());
    }

    // user
    fromSR(sr, mods) {
        return this.#calculate(sr, this.#fixMods(mods));
    }

    async fromMap(bid, mods = []) {
        const mod = this.#fixMods(mods);
        const sr = await this.#getSr(bid, mod);

        return [this.#calculate(sr, mod), sr];
    }
}
