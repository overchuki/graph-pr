require("dotenv").config();
const fs = require("fs");
const mysql = require("mysql2");

let pool = null;

module.exports = {
    connectToDB: async () => {
        return new Promise((res, rej) => {
            if (pool === null) {
                const devDBParams = {
                    connectionLimit: 10,
                    host: process.env.DB_HOST,
                    port: process.env.DB_PORT,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASS,
                    database: process.env.DB_NAME,
                };

                // Determine if production build, if it is set db params to clearDB url
                const isProd = process.env.NODE_ENV === "production";
                const connectionParams = isProd ? process.env.CLEARDB_DATABASE_URL : devDBParams;

                pool = mysql.createPool(connectionParams);

                pool.getConnection(async (err, connection) => {
                    if (err) rej(err);
                    else {
                        connection.queryAsync = (sql, args) => {
                            return new Promise((resolve, reject) => {
                                connection.query(sql, args, (err, result) => {
                                    if (err) reject(err);
                                    else resolve(result);
                                });
                            });
                        };

                        const initialSQL = fs.readFileSync(`${__dirname}/initial.sql`).toString().split(";");
                        for (let sql of initialSQL) {
                            if (sql.length === 0) continue;
                            try {
                                await connection.queryAsync(sql);
                            } catch (err) {
                                console.log("Error with initial sql: ", err);
                                break;
                            }
                        }

                        res(connection);
                    }
                });
            } else {
                pool.getConnection((err, connection) => {
                    if (err) rej(err);
                    else {
                        connection.queryAsync = (sql, args) => {
                            return new Promise((resolve, reject) => {
                                connection.query(sql, args, (err, result) => {
                                    if (err) reject(err);
                                    else resolve(result);
                                });
                            });
                        };

                        res(connection);
                    }
                });
            }
        });
    },
};

module.exports.db = async (req, res, next) => {
    try {
        req.conn = await module.exports.connectToDB();
    } catch (err) {
        console.error("Error with DB connection:", err);
    }
    next();
};
