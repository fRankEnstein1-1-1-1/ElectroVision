import getSignup from "../controllers/signup_control.js";
import userlogin from "../controllers/login_control.js";
import express from "express";
const userRouter = express.Router();
userRouter.post('/login',userlogin);//domain/api/v1/user/login
userRouter.post('/sign',getSignup);//domain/api/v1/user/sign
export default userRouter;