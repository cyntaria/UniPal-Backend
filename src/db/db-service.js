const mysql2 = require('mysql2');
const {
    DuplicateEntryException,
    ForeignKeyViolationException
} = require('../utils/exceptions/database.exception');
const { ErrorStatusCodes } = require('../utils/errorStatusCodes.utils');
const { InternalServerException } = require('../utils/exceptions/api.exception');

class DatabaseService {
    init({ host, user, password, database, dateStrings }) {
        if (!this.dbPool){
            this.dbPool = mysql2.createPool({
                host: host,
                user: user,
                password: password,
                database: database,
                dateStrings: dateStrings
            });
        }
    }

    checkConnection() {
        this.dbPool.getConnection((err, connection) => {
            if (err){
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.');
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.');
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.');
                }
            }
            if (connection){
                connection.release();
            }
        });
    }

    #getConnection = () => {
        this.dbPool.getConnection((err, connection) => {
            if (err){
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    console.error('Database connection was closed.');
                }
                if (err.code === 'ER_CON_COUNT_ERROR') {
                    console.error('Database has too many connections.');
                }
                if (err.code === 'ECONNREFUSED') {
                    console.error('Database connection was refused.');
                }
            }
            if (connection){
                return connection;
            }
        });
    }
    
    query = async(sql, values) => {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            };
            // console.log(`[SQL] ${sql}`);
            // console.log(`[VALUES] ${values}`);
            this.dbPool.execute(sql, values, callback); // execute will internally call prepare and query
        }).catch((err) => {
            const mysqlErrorList = Object.keys(HttpStatusCodes);
            if (mysqlErrorList.includes(err.code)) {
                err.status = HttpStatusCodes[err.code];
                if (err.status === ErrorStatusCodes.DuplicateEntry) throw new DuplicateEntryException(err.message);
                if (err.status === ErrorStatusCodes.ForeignKeyViolation) throw new ForeignKeyViolationException(err.message);
            }

            console.log(`[DBError] ${err}`);
            console.log(`[Code] ${err.code}`);
            throw new InternalServerException();
            // throw err;
        });
    }

    beginTransaction = async() => {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            };
            const conn = this.#getConnection();
            if (conn) conn.beginTransaction(callback);
        });
    }

    rollback = async() => {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            };
            const conn = this.#getConnection();
            if (conn) {
                conn.rollback(callback);
                conn.release();
            }
        });
    }

    commit = async() => {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    reject(error);
                    this.rollback();
                    return;
                }
                resolve(result);
            };
            const conn = this.#getConnection();
            if (conn) {
                conn.commit(callback);
                conn.release();
            }
        });
    }
}

// ENUM of mysql errors mapped to http status codes
const HttpStatusCodes = Object.freeze({
    ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: 422,
    ER_DUP_ENTRY: 409,
    ER_NO_REFERENCED_ROW_2: 512
});

module.exports.DBService = new DatabaseService();