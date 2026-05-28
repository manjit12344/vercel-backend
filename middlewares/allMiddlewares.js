import express from 'express';
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet';
import { sql } from '../config/config.js';

import { getAuth } from "@clerk/express";  //important for auth check
// custom middlewares

const app = express();

export const requireAdmin = async (req,res,next)=>{
 try {
   const {userId} = getAuth(req);

   if(!userId) return res.status(401).json({success:false, msg:'not logged in'});

   const user = await sql`
     SELECT * FROM users WHERE clerk_id = ${userId}
   `
   if(user.length === 0) return res.status(401).json({msg:"user not found"});

   if(user[0].role !== "admin") return res.status(403).json({msg:'access denied'});
   
   next();
}catch(error){
    console.log(error);
    return res.status(500).json({ msg: "Server error" });
}
}
