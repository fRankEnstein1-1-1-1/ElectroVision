import express from "express"; 
import userRouter from "./user_router";
const appRouter = express.Router();
export default appRouter;
appRouter.use('/user',userRouter) // domain/api/v1/user