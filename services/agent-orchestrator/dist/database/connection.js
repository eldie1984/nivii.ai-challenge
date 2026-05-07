"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabase = exports.connectDatabase = void 0;
const pg_1 = require("pg");
const config_1 = require("../config");
let pool;
const connectDatabase = async () => {
    if (!pool) {
        pool = new pg_1.Pool({
            connectionString: config_1.config.DATABASE_URL,
        });
    }
    return pool;
};
exports.connectDatabase = connectDatabase;
const getDatabase = async () => {
    if (!pool) {
        await (0, exports.connectDatabase)();
    }
    return pool;
};
exports.getDatabase = getDatabase;
//# sourceMappingURL=connection.js.map