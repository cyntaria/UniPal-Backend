const mysql2 = require('mysql2');
const {
    DuplicateEntryException,
    ForeignKeyViolationException,
    DatabaseException
} = require('../utils/exceptions/database.exception');
const { ErrorStatusCodes } = require('../utils/errorStatusCodes.utils');
const { InternalServerException } = require('../utils/exceptions/api.exception');
const {Config} = require('../configs/config');

class DatabaseService {
    init({ host, user, password, database, connLimit, dateStrings }) {
        if (!this.dbPool){
            this.dbPool = mysql2.createPool({
                host: host,
                user: user,
                password: password,
                database: database,
                connectionLimit: connLimit,
                dateStrings: dateStrings
            });
        }
    }

    checkConnection() {
        this.dbPool.getConnection((err, connection) => {
            if (err){
                if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                    throw new DatabaseException('Database connection was closed.');
                } else if (err.code === 'ER_CON_COUNT_ERROR') {
                    throw new DatabaseException('Database has too many connections.');
                } else if (err.code === 'ECONNREFUSED') {
                    throw new DatabaseException('Database connection was refused.');
                }
            }
            if (connection){
                connection.release();
            }
        });
    }
    
    query = async(sql, values, multiple = false) => {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            };
            if (Config.NODE_ENV === 'dev') console.log(`[SQL] ${sql}`);
            if (Config.NODE_ENV === 'dev') console.log(`[VALUES] ${values}`);
            if (multiple) this.dbPool.query(sql, values, callback);
            else this.dbPool.execute(sql, values, callback); // execute will internally call prepare and query
        }).catch((err) => {
            const mysqlErrorList = Object.keys(HttpStatusCodes);
            if (mysqlErrorList.includes(err.code)) {
                err.status = HttpStatusCodes[err.code];
                if (err.status === ErrorStatusCodes.DuplicateEntry) throw new DuplicateEntryException(err.message);
                if (err.status === ErrorStatusCodes.ForeignKeyViolation) throw new ForeignKeyViolationException(err.message);
            }

            console.log(`[DBError] ${err}`);
            console.log(`[Code] ${err.code}`);
            console.log(`[SQL] ${sql}`);
            console.log(`[VALUES] ${values}`);
            throw new InternalServerException();
            // throw err;
        });
    };

    beginTransaction = async() => {
        return new Promise((resolve, reject) => {
            this.dbPool.getConnection((err, connection) => {
                if (err){
                    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                        throw new DatabaseException('Database connection was closed.');
                    } else if (err.code === 'ER_CON_COUNT_ERROR') {
                        throw new DatabaseException('Database has too many connections.');
                    } else if (err.code === 'ECONNREFUSED') {
                        throw new DatabaseException('Database connection was refused.');
                    }
                }
                if (connection){
                    const callback = (error, result) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(result);
                    };
                    connection.beginTransaction(callback);
                    this.dbConnection = connection;
                }
            });
        });
    };

    rollback = async() => {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            };
            this.dbConnection.rollback(callback);
            this.dbConnection.release();
        });
    };

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
            this.dbConnection.commit(callback);
            this.dbConnection.release();
        });
    };
}

// ENUM of mysql errors mapped to http status codes
const HttpStatusCodes = Object.freeze({
    ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: 422,
    ER_DUP_ENTRY: 409,
    ER_NO_REFERENCED_ROW_2: 512
});

module.exports.DBService = new DatabaseService();