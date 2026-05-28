import {sql} from '../config/config.js';
import { getAuth     } from "@clerk/express";

export const syncUser = async(req,res)=>{

    const {userId} = getAuth(req);
    if(!userId) return res.status(401).json({message:'not logged in'});//if user not exist
    

    const user = await sql`
      SELECT * FROM  users WHERE clerk_id = ${userId}
    
    `
    console.log("INSERTING USER");
    if(user.length === 0){ //if not exist
        const newUser = await sql`
        INSERT INTO users (clerk_id) VALUES(${userId}) RETURNING *
        `
        return res.json({
            message:'new user is created',
            user: newUser[0]
        })
    }
    //if user existes
    return res.json({
            message:'user already existes',
            user:user[0],
    })
}