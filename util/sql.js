import mysql from "mysql";
import util from "util";
import consola from "consola";
import config from "../config.json" assert { type: "json" };

export const connection = mysql.createConnection(config.dsn);
export const query = util.promisify(connection.query).bind(connection);

connection.connect((err) => {
    if (err) {
        consola.fatal(err);
        process.exit(1);
    }

    consola.success("connected to sql");
});
