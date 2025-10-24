import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const ADMIN = {
    username: 'legendy',
    passwordHash: bcrypt.hashSync('root241', 10),
};

const JWT_SECRET = 'ewfewf2342132fwef423rr2f43f4g52sa3r242';

export const login = (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (username !== ADMIN.username || !bcrypt.compareSync(password, ADMIN.passwordHash)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '4h' });
    res.json({ token });
};

export const protectedRoute = (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
        res.json({ message: 'Access granted' });
    } catch {
        res.sendStatus(403);
    }
};
