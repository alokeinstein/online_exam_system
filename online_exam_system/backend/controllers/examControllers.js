import db from '../config/db.js';

 const saveAnswer = async (req, res) => {
    const { questionId, selectedOption } = req.body;
    const { candidateId } = req;
    try {
        const qRes = await db.query('SELECT correct_option FROM questions WHERE id = $1', [questionId]);
        if (qRes.rows.length === 0) return res.status(404).json({ error: 'Question not found.' });
        const isCorrect = (selectedOption === qRes.rows[0].correct_option);
        const query = `
            INSERT INTO answers (candidate_id, question_id, selected_option, is_correct) VALUES ($1, $2, $3, $4)
            ON CONFLICT (candidate_id, question_id) DO UPDATE SET selected_option = EXCLUDED.selected_option, is_correct = EXCLUDED.is_correct;`;
        await db.query(query, [candidateId, questionId, selectedOption, isCorrect]);
        res.status(201).json({ success: true });
    } catch (err) {
        console.error('Error saving answer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const submitExam = async (req, res) => {
    console.log("submitting exam");
    const { courseId } = req.body;
    const { candidateId } = req;

    // Validate input
    if (!courseId || !candidateId) {
        return res.status(400).json({ error: 'Missing courseId or candidateId' });
    }

    try {
        const scoreQuery = `
            SELECT COUNT(*) 
            FROM answers a 
            JOIN questions q ON a.question_id = q.id 
            WHERE a.candidate_id = $1 AND q.course_id = $2 AND a.is_correct = TRUE;`;

        const scoreResult = await db.query(scoreQuery, [candidateId, courseId]);

        const score = scoreResult.rows[0]?.count ? parseInt(scoreResult.rows[0].count) : 0;

        const resultQuery = `
            INSERT INTO exam_results (candidate_id, course_id, score) 
            VALUES ($1, $2, $3) 
            RETURNING id, score, attempted_on;`;
            
        const { rows } = await db.query(resultQuery, [candidateId, courseId, score]);
        
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error submitting exam:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

 const getResultDetails = async (req, res) => {
    const { resultId } = req.params;
    const { candidateId } = req;
    try {
        const rQuery = `SELECT r.id, r.score, r.attempted_on, c.name as course_name, c.id as course_id FROM exam_results r JOIN courses c ON r.course_id = c.id WHERE r.id = $1 AND r.candidate_id = $2;`;
        const rResult = await db.query(rQuery, [resultId, candidateId]);
        if (rResult.rows.length === 0) return res.status(404).json({ error: 'Result not found.' });
        const finalResult = rResult.rows[0];
        const sQuery = `SELECT q.id, q.question_text, q.options, q.correct_option, a.selected_option, a.is_correct FROM questions q LEFT JOIN answers a ON q.id = a.question_id AND a.candidate_id = $1 WHERE q.course_id = $2 ORDER BY q.id;`;
        const summaryResult = await db.query(sQuery, [candidateId, finalResult.course_id]);
        res.json({ ...finalResult, summary: summaryResult.rows });
    } catch (err) {
        console.error('Error fetching result details:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

 const getAllUserResults = async (req, res) => {
    const { candidateId } = req;
    try {
        const query = `SELECT r.id, r.score, r.attempted_on, c.name as course_name, (SELECT COUNT(*) FROM questions WHERE course_id = c.id) as total_questions FROM exam_results r JOIN courses c ON r.course_id = c.id WHERE r.candidate_id = $1 ORDER BY r.attempted_on DESC;`;
        const { rows } = await db.query(query, [candidateId]);
        res.json(rows);
    } catch (err) {
        console.error('Error fetching user results:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const examController = { saveAnswer, submitExam, getResultDetails, getAllUserResults };
export default examController;