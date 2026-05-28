import express from "express";
import {sql} from "../config/config.js";
import { requireAuth } from "@clerk/express"; //check if user is logged in
import { requireAdmin } from "../middlewares/allMiddlewares.js";
import {
  getAllProducts,
  getIdProduct,
  getCategoryProducts,
  getSearchProducts,
  postProduct,
  updateProduct,
  deleteProduct
} from '../controllers/02ProductsRoutes.js'


const router = express.Router();

router.get('/',getAllProducts);

router.get('/search',getSearchProducts);

router.get('/:product_id',getIdProduct);

router.get('/specific/:category_id',getCategoryProducts);

router.post('/',postProduct);

router.put('/:product_id',requireAuth(),requireAdmin,updateProduct);

router.delete('/:product_id',requireAuth(),requireAdmin,deleteProduct);

export default router
