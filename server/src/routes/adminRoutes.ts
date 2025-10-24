import express from 'express';
import {login, protectedRoute} from "../controllers/adminController";

const router = express.Router();

router.post('/login', login);
router.get('/protected', protectedRoute);

export default router;
