/* eslint-disable new-cap */
const favoriteTables = require('../controllers/favoriteTable.controller.cjs');

const router = require('express').Router();

router.post('/api/favoriteTable/:id', favoriteTables.createFavoriteTable);
router.get('/api/favoriteTable/:id', favoriteTables.getFavoriteTableList);
module.exports = router;
