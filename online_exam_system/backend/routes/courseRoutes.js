// routes/courseRoutes.js
import express from 'express';
const router = express.Router();
import courseController from '../controllers/courseController.js';
router.get('/courses', courseController.getAllCourses);
router.get('/questions/:courseId', courseController.getQuestionsByCourse);

export default router;


