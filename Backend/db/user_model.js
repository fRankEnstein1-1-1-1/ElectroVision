import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name:{
            type:String,
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        password:{
            type:String,
            required:true,
        }
,
        isGovt:{
            type:Boolean,
        }
        ,
        hasAcess:{
            type:Boolean,
        },
        reqid:{
            type:Number,
        },
    }
);

const User = new mongoose.model('User',userSchema);

export default User;