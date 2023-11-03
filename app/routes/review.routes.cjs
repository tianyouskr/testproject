/* eslint-disable new-cap */
const reviews = require('../controllers/review.controller.cjs');
const router = require('express').Router();

router.post('/api/reviews/:id', reviews.createReview);
router.get('/api/reviews/getConsultantReview/:id', reviews.getConsultantReview);
router.get('/api/reviews/getUserReview/:id', reviews.getUserReview);

module.exports = router;
