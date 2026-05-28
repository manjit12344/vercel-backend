import { sql } from '../config/config.js';


//get category    (all user and admin);
//post category   (admin)
//put category    (admin)
//delete category (admin)

  //get route
    export const getCategory = async (req, res) => {
        try {
            const category = await sql`
                SELECT * FROM category
                ORDER BY created_at DESC
            `
            return res.status(200).json({
                success: true,
                categories: category,
            });

        }
        catch (error) {
            console.log('error occured', error);
            return res.status(500).json({
                success: false,
                msg: 'server crashed'
            });
        }
    }

    //idCategoryRoute

    export const getIdCategory = async(req,res)=>{
        const {category_id} = req.params;
        try{
            const category = await sql`
            SELECT * FROM category WHERE category_id = ${category_id}
            `
            if(category.length === 0) return res.json({success:false,msg:'not found'});
            return res.json({
                success:true,
                data:category,
                msg:'category found'
            })
        }
        catch(error){
            console.log('error occured', error);
            return res.status(500).json({
                success: false,
                msg: 'server crashed'
            });
        }
    }

    //post route

export const postCategory = async (req, res) =>{
    const {category_name,category_image} = req.body;
    try{
      const newCategory =  await sql`
        INSERT INTO category (category_name,category_image) VALUES (${category_name},${category_image}) RETURNING *
        `
        return res.json({
            success:true,
            category:newCategory[0]
        })
    }
    catch(error){
        console.log('error occured', error);
        return res.status(500).json({
            success: false,
            msg: 'server crashed'
        });
    }
}

   //put route

export const putCategory= async(req,res)=>{
    const {category_id} = req.params
    const {category_name,category_image} = req.body;
    try{
        const updateCategory = await sql`
          UPDATE category set category_name = ${category_name}, category_image=${category_image} WHERE category_id = ${category_id} RETURNING *
        `
        if(updateCategory.length === 0) return res.json({
            msg:'category not found'
        })
         return res.json({
            success:true,
            category:updateCategory[0]
        })
    }
    catch(error){
        console.log('error occured', error);
        return res.status(500).json({
            success: false,
            msg: 'server crashed'
        });
    }
}

//delete route

export const deleteCategory = async(req,res)=>{
    const {category_id} = req.params;
    try{
       const deleted =  await sql`
         DELETE FROM category WHERE category_id = ${category_id} RETURNING *
        `
        if(deleted.length === 0) return res.json({msg:"item ain't exist"});
        return res.json({
            success:true,
            msg:"deleted successfully!"
        })
    }
    catch(error){
      console.log('error occured', error);
        return res.status(500).json({
            success: false,
            msg: 'server crashed'
        });
    }
} 