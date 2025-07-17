import db from '../config/db.js'; 
import bcrypt from 'bcrypt';

const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const query = 'INSERT INTO candidates (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email;';
        const { rows } = await db.query(query, [name, email, hashedPassword]);
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Email already exists.' });
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    try {
        const { rows } = await db.query('SELECT * FROM candidates WHERE email = $1', [email]);
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }
        res.json({
            token: user.id,
            user: { id: user.id, name: user.name, email: user.email }
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const authController = {login, register}
export default authController

























