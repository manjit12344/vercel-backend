//importing libraries
import express from 'express';
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDB } from './DB/schema.js';
import { clerkMiddleware } from '@clerk/express'
import { requireAuth } from '@clerk/express';

//importing Routes
import log from './routes/LoginRoute.js'
import router from './routes/01CategoryRoutes.js';
import productRoute from './routes/02ProductsRoutes.js'
import cartItems from './routes/03cartRoutes.js'
import address from './routes/04addressRoutes.js'
import Orders from './routes/05orderRoute.js'


dotenv.config();
let port = process.env.PORT;
let app = express();
app.use(clerkMiddleware())

app.use(helmet({
    contentSecurityPolicy:false,
}));


app.use(morgan("dev"));
app.use(express.json());
app.use(cors({
  origin: "https://vercel-frontend-yjhq.vercel.app",
  credentials: true
}));

//starter
app.get("/",(req,res)=>{
  res.json({
      message:"API is running !!",
      category:"/category",
      products:"/my_products",
      cart:"/cartItems",
      orders:"/my_orders"
  });
});

//login
app.use('/login',log)

//category
app.use("/category",router);

//products
app.use("/my_products",productRoute);

//cartItems
app.use("/cartItems",cartItems);

//userAddress
app.use("/address",address);

app.use("/my_orders",Orders);

initDB().then(()=>{app.listen(port,"0.0.0.0",()=>console.log(`server is running on port ${port}`))});

