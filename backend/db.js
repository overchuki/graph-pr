require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2');

let connection = null;

module.exports = {
    connectToDB: async () => {
        return new Promise((res, rej) => {
            if(connection === null){
                connection = mysql.createConnection({
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASS,
                    database: process.env.DB_NAME
                });

                connection.connect(async (err) => {
                    if(err) rej(err);
                    else {
                        connection.queryAsync = (sql, args) => {
                            return new Promise((resolve, reject) => {
                                connection.query(sql, args, (err, result) => {
                                    if(err) reject(err);
                                    else resolve(result);
                                });
                            });
                        }

                        const initialSQL = fs.readFileSync(`${__dirname}/initial.sql`).toString().split(';');
                        for(let sql of initialSQL){
                            if(sql.length === 0) continue;
                            try{
                                await connection.queryAsync(sql, []);
                            }catch(err){
                                console.log('Error with initial sql: ', err);
                                break;
                            }
                        }

                        res(connection);
                    }
                });
            }else{
                res(connection);
            }
        });
    }
}

module.exports.db = async (req, res, next) => {
    req.conn = await module.exports.connectToDB();
    next();
}