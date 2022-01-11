const { DBService } = require('./db-service');

class DBTransaction {
    constructor(connection) {
        if (typeof connection === 'undefined') {
            throw new Error('Cannot be called directly');
        }
        this.connection = connection;
    }

    static begin = async() => {
        var connection = await this.#beginTransaction();
        return new DBTransaction(connection);
    };

    static #beginTransaction = async() => {
        let connection = await DBService.getConnection();
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    connection.release();
                    reject(error);
                    return;
                }
                resolve(result);
            };
            connection.beginTransaction(callback);
            resolve(connection);
        });
    };

    rollback = async() => {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    this.connection.release();
                    reject(error);
                    return;
                }
                this.connection.release();
                resolve(result);
            };
            this.connection.rollback(callback);
        });
    };

    commit = async() => {
        return new Promise((resolve, reject) => {
            const callback = (error, result) => {
                if (error) {
                    this.rollback();
                    reject(error);
                    return;
                }
                this.connection.release();
                resolve(result);
            };
            this.connection.commit(callback);
        });
    };
}

module.exports.DBTransaction = DBTransaction;