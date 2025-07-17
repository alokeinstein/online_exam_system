
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs"); // For password hashing
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// --- Database Configuration ---
const pool = new Pool({
  // connectionString: process.env.DATABASE_URL,
  user: "postgres",
  host: "localhost",
  database: "online_exam",
  password: "admin",
  port: 5432,
});

// --- Middleware ---
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Allow Authorization header
  })
);
app.use(express.json());

// --- Authentication Middleware (Placeholder) ---
// In a real app, you'd verify a JWT here. For now, we'll just extract the user ID.
const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // The "token" is just the candidateId for this example.
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401); // Unauthorized

  req.candidateId = parseInt(token); // Add candidateId to the request object
  next();
};

// --- API Routes ---

// === Auth Routes ===

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required." });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserQuery = `
            INSERT INTO candidates (name, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, name, email;
        `;
    const { rows } = await pool.query(newUserQuery, [
      name,
      email,
      hashedPassword,
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      // Unique constraint violation
      return res.status(409).json({ error: "Email already exists." });
    }
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const userQuery = "SELECT * FROM candidates WHERE email = $1";
    const { rows } = await pool.query(userQuery, [email]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // In a real app, you'd generate a JWT here.
    // For this example, we'll just send back the user object as the "token".
    res.json({
      token: user.id, // The "token" is just the user ID for simplicity
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === Course and Question Routes (Public) ===

app.get("/api/courses", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM courses ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/questions/:courseId", async (req, res) => {
  const { courseId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  try {
    const questionsQuery = `
      SELECT id, question_text, options 
      FROM questions WHERE course_id = $1 ORDER BY id LIMIT $2 OFFSET $3`;
    const questionsResult = await pool.query(questionsQuery, [
      courseId,
      limit,
      offset,
    ]);

    const totalCountQuery =
      "SELECT COUNT(*) FROM questions WHERE course_id = $1";
    const totalCountResult = await pool.query(totalCountQuery, [courseId]);
    const totalQuestions = parseInt(totalCountResult.rows[0].count);

    res.json({
      questions: questionsResult.rows,
      totalPages: Math.ceil(totalQuestions / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// === Protected Routes (Require Authentication) ===

// Save a single answer
app.post("/api/answers", authenticate, async (req, res) => {
  const { questionId, selectedOption } = req.body;
  const candidateId = req.candidateId; // Get ID from auth middleware

  try {
    const questionResult = await pool.query(
      "SELECT correct_option FROM questions WHERE id = $1",
      [questionId]
    );
    if (questionResult.rows.length === 0)
      return res.status(404).json({ error: "Question not found." });

    const isCorrect = selectedOption === questionResult.rows[0].correct_option;

    const upsertQuery = `
            INSERT INTO answers (candidate_id, question_id, selected_option, is_correct)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (candidate_id, question_id)
            DO UPDATE SET selected_option = EXCLUDED.selected_option, is_correct = EXCLUDED.is_correct;
        `;
    await pool.query(upsertQuery, [
      candidateId,
      questionId,
      selectedOption,
      isCorrect,
    ]);
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Error saving answer:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Submit exam and calculate score
app.post("/api/exams/submit", authenticate, async (req, res) => {
  const { courseId } = req.body;
  const candidateId = req.candidateId;

  try {
    const scoreQuery = `
            SELECT COUNT(*) FROM answers a
            JOIN questions q ON a.question_id = q.id
            WHERE a.candidate_id = $1 AND q.course_id = $2 AND a.is_correct = TRUE;`;
    const scoreResult = await pool.query(scoreQuery, [candidateId, courseId]);
    const score = parseInt(scoreResult.rows[0].count);

    const insertResultQuery = `
            INSERT INTO exam_results (candidate_id, course_id, score)
            VALUES ($1, $2, $3)
            RETURNING id, score, attempted_on;`;
    const finalResult = await pool.query(insertResultQuery, [
      candidateId,
      courseId,
      score,
    ]);

    res.status(201).json(finalResult.rows[0]);
  } catch (err) {
    console.error("Error submitting exam:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific exam result by its ID
app.get("/api/results/:resultId", authenticate, async (req, res) => {
  const { resultId } = req.params;
  const candidateId = req.candidateId;

  try {
    const resultQuery = `
            SELECT r.id, r.score, r.attempted_on, c.name as course_name, c.id as course_id
            FROM exam_results r
            JOIN courses c ON r.course_id = c.id
            WHERE r.id = $1 AND r.candidate_id = $2;`;
    const resultResult = await pool.query(resultQuery, [resultId, candidateId]);

    if (resultResult.rows.length === 0) {
      return res
        .status(404)
        .json({
          error: "Result not found or you do not have permission to view it.",
        });
    }
    const finalResult = resultResult.rows[0];

    const summaryQuery = `
            SELECT q.id, q.question_text, q.options, q.correct_option, a.selected_option, a.is_correct
            FROM questions q
            LEFT JOIN answers a ON q.id = a.question_id AND a.candidate_id = $1
            WHERE q.course_id = $2 ORDER BY q.id;`;
    const summaryResult = await pool.query(summaryQuery, [
      candidateId,
      finalResult.course_id,
    ]);

    res.json({ ...finalResult, summary: summaryResult.rows });
  } catch (err) {
    console.error("Error fetching result details:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all results for the logged-in candidate (for the dashboard)
app.get("/api/my-results", authenticate, async (req, res) => {
  const candidateId = req.candidateId;
  try {
    const resultsQuery = `
            SELECT r.id, r.score, r.attempted_on, c.name as course_name, 
                   (SELECT COUNT(*) FROM questions WHERE course_id = c.id) as total_questions
            FROM exam_results r
            JOIN courses c ON r.course_id = c.id
            WHERE r.candidate_id = $1
            ORDER BY r.attempted_on DESC;`;
    const { rows } = await pool.query(resultsQuery, [candidateId]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching user results:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Server Initialization ---
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
