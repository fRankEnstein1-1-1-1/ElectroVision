import express from 'express';
import dotenv  from 'dotenv';
import { mongoose } from 'mongoose';
import cors from 'cors';
import User from './db/user_model.js';

dotenv.config();

let app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URL)
.then(()=>{console.log("MongoDB Connected Suceesfully !")})
.catch((error)=>{console.log('Cant connect to MobgDB',error)});

app.listen(process.env.PORT,()=>{
console.log("Server is Running!")
})