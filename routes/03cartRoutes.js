import express from 'express';
import {sql} from "../config/config.js";
import { requireAuth } from "@clerk/express";
import {requireAdmin} from "../middlewares/allMiddlewares.js";

import {
    getCart,
    insertIntoCart,
    patchCart,
    deleteCart
} from "../controllers/03cartRoutes.js";

const router = express.Router()

router.get("/",requireAuth(),getCart);

router.post("/",requireAuth(),insertIntoCart);

router.patch("/:product_id",requireAuth(),patchCart);

router.delete("/:product_id",requireAuth(),deleteCart);

export default router


