import User from '../db/user_model.js'
const userlogin = (req,res)=>{
    try {
        const {email,password,reqid} = req.body;
        let existingUser;
        if(!reqid){
             existingUser = User.findOne({email,password})
        }
        else{
                existingUser = User.findOne({email,password,reqid})
        }
if(!existingUser){
    return res.status(200).json({message:"Sign in first"})
}
return res.status(201).json({message:"Sucessfully Logged in !"})
    } catch (error) {

         return res.status(500).json({message:"Error from get userLogin"})
}
    }
export default userlogin;

