/* eslint-disable new-cap */
const users = require('../controllers/user.controller.cjs');
const middlewares=require('../middlewares/verifyToken.cjs');
const router = require('express').Router();

router.post('/api/users', users.createUser);
router.put('/api/users/:id', users.update);
router.get('/api/users/:id', middlewares.verifyUserToken, users.getUser);
router.get('/api/users/getUserCoinLog/:id', users.getUserCoinLog);
router.post('/api/users/login', users.login);
router.delete('/api/users/:id', users.deleteUsers);
module.exports = router;
