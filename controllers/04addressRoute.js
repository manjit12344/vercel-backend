import { sql } from '../config/config.js'
import { getAuth } from '@clerk/express'

export const getAddress = async(req,res)=>{
    const {userId} = getAuth(req);
    if(!userId) return res.status(401).json({success:false,msg:'user not logged in'});

   try{
     const address = await sql`
     SELECT * FROM address WHERE user_id = ${userId} ORDER BY created_at DESC
    `
    if(address.length === 0) return res.json({success:true,msg:'no address found'});
    return res.status(200).json({
        success:true,
        data:address,
    })
   }
   catch(error){
      console.error('error: ', error);
      res.status(500).json({ success: false, msg: "something went wrong" })
   }
}

export const postAddress = async(req,res)=>{
    const {userId} = getAuth(req);
    const {full_name,address_line,city,state,phone_no} = req.body;
    if(!userId) return res.status(401).json({success:false,msg:'user not logged in'});
    if(!full_name || !address_line || !city || !state ||! phone_no){
        return res.status(400).json({
            success:false,
            msg:'missing fields'
        })
    }
   try{
     const post_Address = await sql`
     INSERT INTO address (user_id,full_name,address_line,city,state,phone_no) VALUES (${userId},${full_name},${address_line},${city},${state},${phone_no}) RETURNING *
    `
    return res.json({
        success:true,
        data:post_Address[0],
        msg:'address has been added'
    })
   }
   catch(error){
        console.error('error: ', error);
        res.status(500).json({ success: false, msg: "something went wrong" })
   }
}
export const patchAddress = async(req,res)=>{
    const { id } = req.params;
    const {userId} = getAuth(req);
    const {full_name,address_line,city,state,phone_no} = req.body;
     if(!userId) return res.status(401).json({success:false,msg:'user not logged in'});
    if(!full_name || !address_line || !city || !state ||! phone_no){
        return res.status(400).json({
            success:false,
            msg:'missing fields'
        })
    }
   try{
     const patch_Address = await sql`
      UPDATE address SET full_name=${full_name}, address_line= ${address_line},city=${city},state=${state},phone_no=${phone_no} WHERE user_id=${userId} AND id=${id} RETURNING *
    `
    if (patch_Address.length === 0) {
      return res.status(404).json({
      success: false,
      msg: 'address not found'
        })
    }
    return res.json({
        success:true,
        data:patch_Address[0],
        msg:'address updated'
    })
   }
   catch(error){
        console.error('error: ', error);
        res.status(500).json({ success: false, msg: "something went wrong" })
   }
}
export const deleteAddress = async(req,res)=>{
    const {userId} = getAuth(req);
    const {id} = req.params
    if(!userId) return res.status(401).json({success:false,msg:'user not logged in'});
   try{
     const delete_Address = await sql`
      DELETE FROM address WHERE  user_id=${userId} AND id=${id} RETURNING *
    `
    if(delete_Address.length===0) return res.status(404).json({
        success:false,
        msg:'id not found'
    })
    return res.json({
        success:true,
        data:delete_Address[0],
        msg:'address has been deleted'
    })
   }
   catch(error){
        console.error('error: ', error);
        res.status(500).json({ success: false, msg: "something went wrong" })
   }
}