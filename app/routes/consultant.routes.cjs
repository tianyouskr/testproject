const consultants = require('../controllers/consultant.controller.cjs');
const middlewares=require('../middlewares/verifyToken.cjs');
// eslint-disable-next-line new-cap
const router = require('express').Router();

router.post('/api/consultants', consultants.createConsultant);
router.post('/api/consultants/login', consultants.login);
router.put('/api/consultants/:id', consultants.update);
router.get(
    '/api/consultants/:id',
    middlewares.verifyConsultantToken,
    consultants.getConsultant,
);
router.get('/api/consultants', consultants.getConsultantList);
router.get(
    '/api/consultants/getConsultantById/:id',
    consultants.getConsultantById,
);
router.delete('/api/consultants/:id', consultants.deleteConsultants);
router.get(
    '/api/consultants/getConsultantCoinLog/:id',
    consultants.getConsultantCoinLog,
);

module.exports = router;
