/* eslint-disable new-cap */

const orders = require('../controllers/order.controller.cjs');
const router = require('express').Router();

router.post('/api/orders', orders.createOrder);
// 两种创建订单的途径，一种是直接创建订单，置于订单列表等待顾问接单
router.post(
    '/api/orders/createOrderWithConsultant',
    orders.createOrderWithConsultant,
); // 访问顾问列表，找到特定顾问直接像其发出订单
router.put('/api/orders/:id', orders.acceptOrder); // 对应上面有两种接单途径，这是在订单列表接单
router.put(
    '/api/orders/acceptOrderWithConsultant/:id',
    orders.acceptOrderWithConsultant,
); // 这是接用户直接对其发表的订单，只有该顾问能接此单。
router.get('/api/orders/getOrderDetails/:id', orders.getOrderDetails);
router.get('/api/orders/getOrderList', orders.getOrderList);
router.delete('/api/orders/:id', orders.delete_Orders);
module.exports = router;
