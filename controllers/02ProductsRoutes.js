import {sql} from '../config/config.js'


    /*
    data returning in data:[
    {id:1}
    {id:1}
    {id:2}
    ]
    return in formate data:[
    {id:1}
    {id:2}
    ]
    
    */



function make_right_order(data){
    let newObj = [];
       for(let i=0;i<data.length;i++){
        let cp = data[i];  //currentProduct
        if(i === 0 || data[i].id !== data[i-1].id){
            newObj.push(
                {
                    id:cp.id,
                    name:cp.name,
                    description:cp.description,
                    price:cp.price,
                    image_url:cp.image_url,
                    category_id:cp.category_id,
                    size_stock:[
                        {size:cp.size,
                        stock:cp.stock
                        }
                    ]
                }
            )
        }
        if(i !== 0 && data[i].id === data[i-1].id){
            newObj[newObj.length-1].size_stock.push({
                size:cp.size,
                stock:cp.stock
            })
        }
        
       }
       return newObj;
}


export const getAllProducts = async(req,res)=>{
    //show all products of category x
    try{
        const data = await sql`
         SELECT p.*,ps.size,ps.stock
          FROM products p  
          LEFT JOIN product_sizes ps ON p.id = ps.product_id
          ORDER BY p.id
    `
    if(data.length===0) return res.status(404).json({success:false,msg:`no product found`});
    
    else {
        const newObj = make_right_order(data);
        return res.json({
        success:true,
        products:newObj
    })
    }
}
    catch(error){
       return res.status(500).json({
          success:false,
          msg:'error:something wrong!'
        })
    }
}

//get product x 
export const getIdProduct = async(req,res)=>{
   const {product_id} = req.params;
   try{
     const data = await sql`
         SELECT p.*,ps.size,ps.stock
          FROM products p  
          LEFT JOIN product_sizes ps ON p.id = ps.product_id
          WHERE p.id = ${product_id}
    `
    if(data.length===0) return res.status(404).json({success:false,msg:`no product found`});
    else return res.json({
       
        success:true,
        products:make_right_order(data)
    })

   }catch(error){
    return res.status(500).json({
          success:false,
          msg:'error:something wrong!'
        })

   }
}

//getCategoryProducts

export const getCategoryProducts = async(req,res)=>{
    const {category_id} = req.params;
    try{
        const data = await sql`
        SELECT p.*,ps.size,ps.stock
          FROM products p  
          LEFT JOIN product_sizes ps ON p.id = ps.product_id
          WHERE p.category_id = ${category_id}
        `
        
        if(data.length===0) return res.status(500).json({success:false,msg:`no product of category id ${category_id} found`});
        console.log(data);
        return res.json({
            success:true,
            category:category_id,
            products:make_right_order(data),
            msg:'all products are above'
        })

        
    }
    catch(error){
         return res.status(500).json({
          success:false,
          msg:'error:something wrong!'
        })
    }
}

export const getSearchProducts = async(req,res)=>{
    const {search} = req.query;
    if(search === undefined || search === "") return res.status(400).json({success:false,msg:'search query is required'});
    try{
        const data = await sql`
         SELECT p.*,ps.size,ps.stock
          FROM products p  
          LEFT JOIN product_sizes ps ON p.id = ps.product_id
          WHERE name ILIKE ${'%' + search + '%'} OR description ILIKE ${'%' + search + '%'}`

        if(data.length === 0) return res.status(404).json({success:false,msg:'no Product Found'});
        return res.json({
            success:true,
            data:make_right_order(data),
            msg:'searched items above'
        })
    }catch(error){
          return res.status(500).json({
          success:false,
          msg:'error:something wrong!'
        })
    }
}

//post product x 

export const postProduct = async(req,res)=>{
   const { name, description, price, image_url, category_id } = req.body;
   const {size} = req.body;
   if(!name || !description || !price || !image_url || !category_id ) return res.json({msg:"mtt kro yaar 😢"})
   if(size===undefined || size.length===0) return res.json({msg:"enter stock and size."});
    try{
     const newProduct = await sql`
     INSERT INTO products (name, description, price, image_url, category_id) VALUES (${name}, ${description}, ${price}, ${image_url}, ${category_id}) RETURNING *`
     if(newProduct.length === 0) return res.status(500).json({success:false,msg:`no product added`});
     
     for(const s of size ){
        if (!s.size || s.stock === undefined) throw new Error("Invalid size data");
        
        await sql`
        INSERT INTO product_sizes (product_id,size,stock) VALUES (${newProduct[0].id},${s.size},${s.stock})`
     }
     return res.json({
        success:true,
        products:newProduct[0]
    });
     
   }
   catch(error){
    console.error("error: ",error);
       return res.status(500).json({
          success:false,
          msg:'error:something wrong!'
        })
   }
}

//update product....

export const updateProduct = async(req,res)=>{
    const { name, description, price, image_url, category_id } = req.body;
    const {product_id} = req.params;
    const {size} = req.body;
    if(!name || !description || !price || !image_url || !category_id ) return res.json({msg:"mtt kro yaar 😢"})
    if(size===undefined || size.length===0) return res.json({msg:"enter stock and size."});
    try{
     const updateProduct = await sql`
     UPDATE products SET name=${name}, description=${description}, price=${price},image_url=${image_url},category_id= ${category_id } WHERE id = ${product_id} RETURNING *`
     if(updateProduct.length === 0)return res.status(200).json({success:false,msg:`no product updated`});
     
     for(const s of size){
        if(!s.size || s.stock === undefined) throw new Error("Invalid size data");
        const result = await sql`
        UPDATE product_sizes SET size = ${s.size}, stock = ${s.stock} WHERE product_id = ${product_id} AND size = ${s.size} RETURNING *`
    
    
        if(result.length ===0){
            await sql`
            INSERT INTO product_sizes (product_id,size,stock) VALUES (${product_id},${s.size},${s.stock})`
        }
    }
     
     return res.json({
        success:true,
        products:updateProduct[0],
    });
   }
   catch(error){
       
       return res.status(500).json({
          success:false,
          msg:'error:something wrong!'
        })
   }

}

// Delete product

export const deleteProduct = async(req,res)=>{
    const {product_id} = req.params;
    try{
        const deletesome = await sql`
        DELETE FROM products WHERE id = ${product_id} RETURNING *
        `
        if(deletesome.length === 0) return  res.json({success:false,msg:'no product there to delete'});
        return res.json({
            success:true,
            msg:'product deleted successfully'
        })
    }
    catch(error){
          console.error("error: ",error); 
          return res.status(500).json({
          success:false,
          msg:'error:something wrong!'
        })
    }
}