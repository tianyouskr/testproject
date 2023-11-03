const dbConfig = require('../config/db.config.cjs');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./user.model.cjs')(sequelize, Sequelize);
db.consultants = require('./consultant.model.cjs')(sequelize, Sequelize);
db.orders = require('./order.model.cjs')(sequelize, Sequelize);
db.reviews = require('./review.model.cjs')(sequelize, Sequelize);
db.favoriteTables = require('./favoriteTable.model.cjs')(sequelize, Sequelize);
db.coinLogs = require('./coinLog.model.cjs')(sequelize, Sequelize);
module.exports = db;
