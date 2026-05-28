import { sql } from '../config/config.js'
import { getAuth } from '@clerk/express'

export const getCart = async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ message: 'not logged in' });
    try {
        const carts = await sql`
         SELECT ci.*,p.name,p.price,p.image_url 
         FROM cart_items ci 
         JOIN products p
         ON ci.product_id = p.id
         WHERE ci.user_id= ${userId}
         ORDER BY ci.created_at DESC
        `
        let total_price = 0;
        for(let i = 0;i<carts.length;i++){
             total_price+=carts[i].price * carts[i].quantity;
             carts[i].price = Number(carts[i].price*carts[i].quantity).toFixed(2);
        }
        
        return res.json({
            success: true,
            data: carts,
            total_price: total_price,
            msg: `above items carted by user with userId ${userId}`
            
        })

    }
    catch (error) {
        console.error('error: ', error);
        res.status(500).json({ success: false, msg: "something went wrong" })
    }
}

export const insertIntoCart = async (req, res) => {
    const { userId } = getAuth(req);
    const { product_id, quantity } = req.body;
    const quant = Number(quantity);

    if (!userId) return res.status(401).json({ message: 'not logged in' });

    if (!product_id || quant < 1){
       return res.status(400).json({ msg: "missing fields" });
     }

    try {
        const existing = await sql`
         SELECT * FROM cart_items WHERE product_id = ${product_id} AND user_id = ${userId}
        `
        if(existing.length > 0){
            const updatedQuantity = await sql`
            UPDATE cart_items SET quantity= quantity + ${quant} WHERE user_id = ${userId} AND product_id = ${product_id} RETURNING *
            `
            return res.json({
                success:true,
                data:updatedQuantity[0],
                msg:'updated quantity'

            })
        }
        const c_item = await sql`
        INSERT INTO cart_items (user_id,product_id,quantity) VALUES (${userId},${product_id},${quant}) RETURNING *

    `
        if (c_item.length === 0) return res.json({ success: false, msg: 'something went wrong' });
        return res.json({
            success: true,
            data: c_item[0],
            msg: 'item inserted'
        })
    } catch (error) {
        console.error('error: ', error);
        res.status(500).json({ success: false, msg: "something went wrong" })
    }

}

export const patchCart = async(req,res)=>{
    const {userId} = getAuth(req);
    const {product_id} = req.params;
    const {quantity} = req.body
    const quant = Number(quantity);

    if(!userId) return res.json({success:false,msg:"no login user"});

    if (!product_id || Number.isNaN(quant) || quant < 0) {
              return res.status(400).json({ msg: "invalid data" });
    }

    try{
         if(quant === 0){
          await sql `
          DELETE FROM cart_items WHERE product_id = ${product_id} AND user_id = ${userId}
          `
          return res.json({
            success:true,
            msg:'deleted from cart'
          })
         }
      const updateQuant = await sql`
            UPDATE cart_items SET quantity= ${quant} WHERE user_id = ${userId} AND product_id = ${product_id} RETURNING *
      `
      res.json({
        success:true,
        data:updateQuant[0]
      })
    }
    catch(error){
      console.error('error: ', error);
      res.status(500).json({ success: false, msg: "something went wrong" })
    }
}

export const deleteCart = async(req,res)=>{
    const {product_id} = req.params;
    const {userId} = getAuth(req);
    if(!userId) return res.status(401).json({success:false,msg:"no login user"});

    if (!product_id) return res.status(400).json({ msg: "product_id is required" });

    try{
       const deleted = await sql`
        DELETE FROM cart_items WHERE user_id = ${userId} AND product_id = ${product_id} RETURNING *
        `
        if(deleted.length === 0) return res.status(404).json({success:false,msg:"item doesn't exist"})
        return res.json({
            success:true,
            deleted:deleted,
            msg:'item deleted'
        })
    }
    catch(error){
        console.error('error: ', error);
        res.status(500).json({ success: false, msg: "something went wrong" })
    }
}

