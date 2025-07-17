import db from '../config/db.js';
const getAllCourses = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM courses ORDER BY name');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getQuestionsByCourse = async (req, res) => {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;
    try {
        const qQuery = 'SELECT id, question_text, options FROM questions WHERE course_id = $1 ORDER BY id LIMIT $2 OFFSET $3';
        const questionsResult = await db.query(qQuery, [courseId, limit, offset]);
        const cQuery = 'SELECT COUNT(*) FROM questions WHERE course_id = $1';
        const totalCountResult = await db.query(cQuery, [courseId]);
        res.json({
            questions: questionsResult.rows,
            totalPages: Math.ceil(parseInt(totalCountResult.rows[0].count) / limit),
            currentPage: page,
        });
    } catch (err) {
        console.error('Error fetching questions:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const courseController = { getAllCourses, getQuestionsByCourse };
export default courseController;
































