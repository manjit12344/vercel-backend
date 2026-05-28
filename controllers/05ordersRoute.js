import { sql } from '../config/config.js'
import { getAuth } from '@clerk/express'

export const getOrder = async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ success: false, msg: "user is not logged in" });
    try {
        const data = await sql`
     SELECT o.*,

     a.full_name,
     a.address_line,
     a.city,
     a.state,

     oi.product_id,
     oi.quantity,
     oi.price,

     a.phone_no,
     p.name,
     p.image_url

     FROM orders o
     
     LEFT JOIN address a
     ON o.address_id = a.id

     LEFT JOIN order_items oi
     ON o.id = oi.order_id

     LEFT JOIN products p
     ON oi.product_id = p.id

     WHERE o.user_id = ${userId}
    `
        if (data.length === 0) return res.status(404).json({ success: false, data: [], msg: 'no order is placed' });
        const new_data = {};

        return res.status(200).json({
            success: true,
            data: data,
            msg: 'above orders are placed'
        })

    } catch (error) {

        console.log("oh shit! error: ", error);
        res.status(500).json({
            success: false,
            data: [],
            msg: "something went wrong!"
        })
    }
}

export const getAdminOrder = async (req, res) => {
    try {
        const data = await sql`
     SELECT o.*,

     a.full_name,
     a.address_line,
     a.city,
     a.state,

     oi.product_id,
     oi.quantity,
     oi.price,

     a.phone_no,
     p.name,
     p.image_url

     FROM orders o
     
     LEFT JOIN address a
     ON o.address_id = a.id

     LEFT JOIN order_items oi
     ON o.id = oi.order_id

     LEFT JOIN products p
     ON oi.product_id = p.id

     WHERE o.user_id = ${userId}
    `
        if (data.length === 0) return res.status(404).json({ success: false, data: [], msg: 'no order is placed' });
        const new_data = {};

        return res.status(200).json({
            success: true,
            data: data,
            msg: 'above orders are placed'
        })

    } catch (error) {

        console.log("oh shit! error: ", error);
        res.status(500).json({
            success: false,
            data: [],
            msg: "something went wrong!"
        })
    }
}

export const postOrder = async (req, res) => {
    const { userId } = getAuth(req);
    const { address_id } = req.body;
    const { product_id, quantity } = req.body;
    const quantityNum = Number(quantity);
    if (!userId) return res.status(401).json({ success: false, data: [], msg: 'user is not logged in' });
    if (!product_id || quantityNum < 1) return res.status(400).json({ success: false, data: [], msg: 'missing fields' });
    if (!address_id) return res.status(400).json({ success: false, data: [], msg: 'missing fields' });

    try {
        const prod = await sql`
        SELECT price FROM products WHERE id=${product_id}`

        if (prod.length === 0) return res.json({ success: false, data: [], msg: "product does not exist" });
        const price = prod[0].price;
        if (price === null) return res.status(400).json({ success: false, msg: 'invalid product price' });
        const total_price = price * quantityNum;

        const post_data = await sql`
        INSERT INTO orders (user_id,address_id,total_price) VALUES (${userId},${address_id},${total_price}) RETURNING *`

        const order_items = await sql`
        INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (${post_data[0].id},${product_id},${quantityNum},${prod[0].price})
        `
        if (post_data.length === 0 || order_items.length === 0) return res.json({ success: false, data: [], msg: 'no order is posted' });
        return res.json({
            success: true,
            data: {
                order: post_data[0],
                order_item: order_items[0]
            },
            msg: "order is posted"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            data: [],
            msg: "something went wrong!"
        })
    }

}

export const deleteOrder = async (req, res) => {
    const { userId } = getAuth(req);
    const { order_id } = req.params;
    if (!userId) return res.json({ success: false, data: [], msg: 'user is not logged in' });
    if (!order_id) return res.status(400).json({ success: false, data: [], msg: 'order id is missing' });

    try {
        const order = await sql`
           SELECT created_at FROM orders 
           WHERE id = ${order_id} AND user_id = ${userId}
        `;
        if (order.length === 0) {
            return res.status(404).json({ success: false, msg: "order not found" });
        }
        const orderTime = new Date(order[0].created_at);
        const currentTime = new Date();

        const diffInMs = currentTime - orderTime;
        const diffInHours = diffInMs / (1000 * 60 * 60) - 5.5;
           console.log("********TIME SEE******", diffInHours);
        if (diffInHours > 1) {
            return res.status(400).json({
                success: false,
                msg: "Order can only be cancelled within 1 hour"
            });
        }
        const data2 = await sql`

        
          DELETE FROM order_items WHERE order_id = ${order_id} RETURNING *
        `
        const data = await sql`
            DELETE FROM orders WHERE id = ${order_id} AND user_id = ${userId} RETURNING *
        `;
        if (data.length === 0 || data2.length === 0) return res.status(404).json({ success: false, data: [], msg: 'order not found' });
        return res.json({
            success: true,
            data: {
                order: data[0],
                order_item: data2[0]
            },
            msg: "order is deleted"
        });
    } catch (error) {
        console.log("oh shit! error: ", error);
        return res.status(500).json({
            success: false,
            data: [],
            msg: "something went wrong!"
        });
    }
}