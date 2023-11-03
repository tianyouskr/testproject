const HOUST = 'localhost';
const USER = 'root';
const PASSWORD = 'Yy3.1415926';
const DB = 'TESTA';
const dialect = 'mysql';
const pool = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000,
};

module.exports = {
  HOUST,
  USER,
  PASSWORD,
  DB,
  dialect,
  pool,
};
