'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const checkstatusandurgent = require('./checktime.cjs');
const app = express();
const corsOptions = {
  origin: 'http://localhost:8081',
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.use('/', require('./app/routes/user.routes.cjs'));
app.use('/', require('./app/routes/consultant.routes.cjs'));
app.use('/', require('./app/routes/order.routes.cjs'));
app.use('/', require('./app/routes/review.routes.cjs'));
app.use('/', require('./app/routes/favoriteTable.routes.cjs'));

checkstatusandurgent.startOrderStatusCheck();
checkstatusandurgent.checkUrgentOrders();
setInterval(checkstatusandurgent.startOrderStatusCheck, 60 * 1000);
setInterval(checkstatusandurgent.checkUrgentOrders, 60 * 1000);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}.`);
});
const db = require('./app/models/index.cjs');
db.sequelize.sync();
