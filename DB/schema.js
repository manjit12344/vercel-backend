import { sql } from '../config/config.js';
import { neon } from '@neondatabase/serverless';

import "dotenv/config";
export async function initDB() {
  try {
    //users
    await sql`
         CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            clerk_id VARCHAR(500) UNIQUE NOT NULL,
            email VARCHAR(255),
            role VARCHAR(20) DEFAULT 'user', --'user' or 'admin'
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )` 
         console.log('user done')
    //category
    await sql`
         CREATE TABLE IF NOT EXISTS category(
            category_id SERIAL PRIMARY KEY,
            category_name VARCHAR(255) UNIQUE NOT NULL,
            category_image TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )`
          console.log('category done')
    //products
    await sql`
         CREATE TABLE IF NOT EXISTS products(
           id SERIAL PRIMARY KEY,
           name VARCHAR(255) NOT NULL,
           description TEXT NOT NULL,
           price NUMERIC(10,2) NOT NULL,
           image_url TEXT,
           category_id INTEGER REFERENCES category(category_id) ON DELETE SET NULL
         )`
          console.log('products done');
      //product sizes
      await sql`
      CREATE TABLE IF NOT EXISTS product_sizes(
         id SERIAL PRIMARY KEY,
         product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
         size VARCHAR(20) NOT NULL,
         stock INTEGER NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )`
         console.log('product size done')
    //carts items 
    await sql`
         CREATE TABLE IF NOT EXISTS cart_items(
           id SERIAL PRIMARY KEY,
           user_id TEXT REFERENCES users(clerk_id) ON DELETE CASCADE,
           product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
           quantity INTEGER DEFAULT 1,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
         )`
        console.log('cart done')
    //address
    await sql`
         CREATE TABLE IF NOT EXISTS address(
           id SERIAL PRIMARY KEY,
           user_id TEXT REFERENCES users(clerk_id) ON DELETE CASCADE,
           full_name VARCHAR(255) NOT NULL,
           address_line TEXT,
           city VARCHAR(255) NOT NULL,
           state VARCHAR(20) NOT NULL,
           phone_no VARCHAR(20) NOT NULL,
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           
         )
        `
         console.log('address done')

    //orders
    await sql`
         CREATE TABLE IF NOT EXISTS orders(
           id SERIAL PRIMARY KEY,
           user_id TEXT REFERENCES users(clerk_id) ON DELETE CASCADE,
           address_id INTEGER REFERENCES address(id) ON DELETE SET NULL,
           total_price NUMERIC(10,2) NOT NULL,
           status VARCHAR(20) DEFAULT 'pending', --'pending','shipping','delivered',
           payment_status VARCHAR(20) DEFAULT 'pending',
           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
         )
        `
      console.log('order done')
    //order items
    await sql`
        CREATE TABLE IF NOT EXISTS order_items(
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
            product_id INTEGER REFERENCES products(id),
            quantity INTEGER CHECK (quantity > 0),
            price NUMERIC(10,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
         console.log('order item done');
    await sql`
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
            amount NUMERIC(10,2),
            status VARCHAR(50), -- pending, success, failed
            method VARCHAR(50), -- COD, UPI, card
            transaction_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `
        console.log('payment done');
        console.log("DB setup is perfect")
  } catch (error) {
    console.error('error in DB setup: ', error);
  }
}