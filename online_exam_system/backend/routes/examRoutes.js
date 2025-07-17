// routes/examRoutes.js

import express from 'express';
import examController from '../controllers/examControllers.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All these routes are protected
router.use(authenticate);

router.post('/answers', examController.saveAnswer);
router.post('/exams/submit', examController.submitExam);
router.get('/results/:resultId', examController.getResultDetails);
router.get('/my-results', examController.getAllUserResults);

export default router;























