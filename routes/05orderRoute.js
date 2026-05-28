import express from 'express';
import {requireAuth} from '@clerk/express'
import {requireAdmin} from '../middlewares/allMiddlewares.js'
import {
    getOrder,
    postOrder,
    deleteOrder

}from '../controllers/05ordersRoute.js'

const router = express.Router();

router.get('/',requireAuth(),getOrder);
router.post('/',requireAuth(),postOrder);
router.delete('/:order_id',requireAuth(),deleteOrder);

export default router