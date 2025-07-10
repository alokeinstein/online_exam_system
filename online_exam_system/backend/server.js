// const express = require('express');
// const db = require('./db');

// const app = express();
// const PORT = 3000;

// app.get('/users', async (req, res) => {
//   try {
//     const result = await db.query('SELECT * FROM users');
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send('Server error');
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });




// server.js
// Main entry point for the backend application

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// --- Database Configuration ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // If you're running locally without SSL, you might need this:
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

// --- Middleware ---
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// --- API Routes ---

// 1. Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM courses ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Get questions for a specific course with pagination
app.get('/api/questions/:courseId', async (req, res) => {
  const { courseId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    // Query to get the paginated questions
    const questionsQuery = `
      SELECT id, question_text, options 
      FROM questions 
      WHERE course_id = $1 
      ORDER BY id 
      LIMIT $2 OFFSET $3
    `;
    const questionsResult = await pool.query(questionsQuery, [courseId, limit, offset]);

    // Query to get the total number of questions for the course
    const totalCountQuery = 'SELECT COUNT(*) FROM questions WHERE course_id = $1';
    const totalCountResult = await pool.query(totalCountQuery, [courseId]);
    const totalQuestions = parseInt(totalCountResult.rows[0].count);

    res.json({
      questions: questionsResult.rows,
      totalPages: Math.ceil(totalQuestions / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Submit a single answer in real-time
// In a real app, you'd have candidate authentication. For now, we'll use a placeholder.
app.post('/api/answers', async (req, res) => {
    const { candidateId, questionId, selectedOption } = req.body;

    if (!candidateId || !questionId || selectedOption === undefined) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
        // First, get the correct option to check if the answer is correct
        const questionResult = await pool.query('SELECT correct_option FROM questions WHERE id = $1', [questionId]);
        if (questionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Question not found.' });
        }
        const correctOption = questionResult.rows[0].correct_option;
        const isCorrect = (selectedOption === correctOption);

        // Use UPSERT to either insert a new answer or update an existing one
        const upsertQuery = `
            INSERT INTO answers (candidate_id, question_id, selected_option, is_correct)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (candidate_id, question_id)
            DO UPDATE SET selected_option = EXCLUDED.selected_option, is_correct = EXCLUDED.is_correct;
        `;
        await pool.query(upsertQuery, [candidateId, questionId, selectedOption, isCorrect]);
        
        res.status(201).json({ success: true, message: 'Answer saved.' });
    } catch (err) {
        console.error('Error saving answer:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// 4. Submit the entire exam and calculate the score
app.post('/api/exams/submit', async (req, res) => {
    const { candidateId, courseId } = req.body;

    if (!candidateId || !courseId) {
        return res.status(400).json({ error: 'Candidate ID and Course ID are required.' });
    }

    try {
        // Calculate the score by counting correct answers for the candidate and course
        const scoreQuery = `
            SELECT COUNT(*) 
            FROM answers a
            JOIN questions q ON a.question_id = q.id
            WHERE a.candidate_id = $1 
            AND q.course_id = $2 
            AND a.is_correct = TRUE;
        `;
        const scoreResult = await pool.query(scoreQuery, [candidateId, courseId]);
        const score = parseInt(scoreResult.rows[0].count);

        // Save the final result to the exam_results table
        const insertResultQuery = `
            INSERT INTO exam_results (candidate_id, course_id, score)
            VALUES ($1, $2, $3)
            RETURNING id, score, attempted_on;
        `;
        const finalResult = await pool.query(insertResultQuery, [candidateId, courseId, score]);

        res.status(201).json(finalResult.rows[0]);

    } catch (err) {
        console.error('Error submitting exam:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 5. Fetch the final result and answer summary
app.get('/api/results/:candidateId/:courseId', async (req, res) => {
    const { candidateId, courseId } = req.params;

    try {
        // Get the final score from exam_results
        const resultQuery = 'SELECT score, attempted_on FROM exam_results WHERE candidate_id = $1 AND course_id = $2 ORDER BY attempted_on DESC LIMIT 1';
        const resultResult = await pool.query(resultQuery, [candidateId, courseId]);

        if (resultResult.rows.length === 0) {
            return res.status(404).json({ error: 'Result not found.' });
        }
        
        const finalResult = resultResult.rows[0];

        // Get the answer summary
        const summaryQuery = `
            SELECT 
                q.id,
                q.question_text,
                q.options,
                q.correct_option,
                a.selected_option,
                a.is_correct
            FROM questions q
            LEFT JOIN answers a ON q.id = a.question_id AND a.candidate_id = $1
            WHERE q.course_id = $2
            ORDER BY q.id;
        `;
        const summaryResult = await pool.query(summaryQuery, [candidateId, courseId]);

        res.json({
            ...finalResult,
            summary: summaryResult.rows
        });

    } catch (err) {
        console.error('Error fetching result:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// --- Server Initialization ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

