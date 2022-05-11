const mysql2 = require('mysql2');
const {
    DuplicateEntryException,
    ForeignKeyViolationException,
    DatabaseException
} = require('../utils/exceptions/database.exception');
const { ErrorStatusCodes } = require('../utils/errorStatusCodes.utils');
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
    
    query = async(sql, values, options = { multiple: false, transaction_conn: null, nestTables: false }) => {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(result);
            };
            if (Config.NODE_ENV === 'dev') {
                console.log(`[SQL] ${sql}`);
                console.log(`[VALUES] ${values}`);
            }

            const queryOptions = {sql, nestTables: options.nestTables};
            
            if (!options) this.dbPool.query(queryOptions, values, callback);
            else if (!options.transaction_conn) {
                if (!options.multiple) this.dbPool.execute(queryOptions, values, callback); // execute will internally call prepare and query
                else this.dbPool.query(queryOptions, values, callback);
            } else {
                if (!options.multiple) options.transaction_conn.execute(queryOptions, values, callback);
                else options.transaction_conn.query(queryOptions, values, callback);
            }
        }).catch((err) => {
            if (Config.NODE_ENV === 'dev') {
                console.log(`[DBError] ${err.message}`);
                console.log(`[Code] ${err.code}`);
            }
            
            const mysqlErrorList = Object.keys(HttpStatusCodes);
            if (mysqlErrorList.includes(err.code)) {
                err.status = HttpStatusCodes[err.code];
                if (err.status === ErrorStatusCodes.DuplicateEntry) throw new DuplicateEntryException(err.message);
                if (err.status === ErrorStatusCodes.ForeignKeyViolation) throw new ForeignKeyViolationException(err.message);
            }

            this.#handleUnknownErrors(sql, values, err);
        });
    };

    #handleUnknownErrors = (sql, values, err) => {
        if (Config.NODE_ENV !== 'dev') {
            console.log(`[SQL] ${sql}`);
            console.log(`[VALUES] ${values}`);
            console.log(`[DBError] ${err.message}`);
            console.log(`[Code] ${err.code}`);
        }
        throw new DatabaseException('', {
            message: `[DBError] ${err.message}`,
            db_code: err.code
        }, false);
    };

    getConnection = async() => {
        return await new Promise((resolve, reject) => {
            this.dbPool.getConnection((err, connection) => {
                if (err){
                    let ex;
                    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                        ex = new DatabaseException('Database connection was closed.');
                    } else if (err.code === 'ER_CON_COUNT_ERROR') {
                        ex = new DatabaseException('Database has too many connections.');
                    } else if (err.code === 'ECONNREFUSED') {
                        ex = new DatabaseException('Database connection was refused.');
                    }
                    reject(ex);
                } else {
                    resolve(connection);
                }
            });
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