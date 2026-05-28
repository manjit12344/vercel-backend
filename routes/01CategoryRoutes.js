import express from "express";
import {sql} from "../config/config.js";
import { requireAuth } from "@clerk/express"; //check if user is logged in
import { requireAdmin } from "../middlewares/allMiddlewares.js";
import {
    getCategory,
    getIdCategory,
    postCategory,
    putCategory,
    deleteCategory
} from "../controllers/01categoryRoutes.js";

const router = express.Router();

router.get('/',getCategory);

router.get('/:category_id',getIdCategory);

router.post('/',requireAuth(),requireAdmin,postCategory);

router.put('/:category_id',requireAuth(),requireAdmin,putCategory);

router.delete('/:category_id',requireAuth(),requireAdmin,deleteCategory)

export default router;

