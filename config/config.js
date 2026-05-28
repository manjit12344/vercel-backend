import express from 'express';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config();

const {DB_URL} = process.env;
export const sql = neon(
    DB_URL
)