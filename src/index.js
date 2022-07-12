import Fastify from "fastify";
import consola from "consola";

import { index, score } from "./routes/routes.js";
import config from "../config.json" assert { type: "json" };

const fastify = Fastify();

fastify.get("/", index);
fastify.post("/", score);

fastify.listen({ port: config.port }, (err) => {
    if (err) {
        consola.fatal(err);
        process.exit(1);
    }

    consola.success(`score-hook :${config.port}`);
});
