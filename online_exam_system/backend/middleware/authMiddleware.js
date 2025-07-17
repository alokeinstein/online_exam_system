
export const authenticate = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) return res.sendStatus(401);

    // For development: treat token as candidateId
    req.candidateId = parseInt(token);
    next();
}



