import express from 'express';
import {sql} from "../config/config.js";
import { requireAuth } from "@clerk/express";
import {requireAdmin} from "../middlewares/allMiddlewares.js";

import {
  getAddress,
  postAddress,
  patchAddress,
  deleteAddress
} from "../controllers/04addressRoute.js"

const router = express.Router();

router.get("/",requireAuth(),getAddress);

router.post("/",requireAuth(),postAddress);

router.patch("/:id",requireAuth(),patchAddress);

router.delete("/:id",requireAuth(),deleteAddress);

export default router;

