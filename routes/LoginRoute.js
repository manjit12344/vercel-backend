import {sql} from '../config/config.js'
import { syncUser } from '../controllers/00LoginRoute.js'
import express from 'express';
import { requireAuth } from "@clerk/express";

const router = express.Router();

router.get("/syncUser",requireAuth(),syncUser);

export default router;