import User from "../db/user_model.js";

const getSignup = async (req,res)=>{
    try{
    const {fullname,email,password} = req.body;
    const exist = await User.findOne({email,password});
    if(!exist){
        const newUser = new User({fullname,email,password}) ;
        newUser.save();
        return res.status(201).json({ message: "User Signed Successfully!" })
    }
    else{
        return res.status(200).json({message:"Already a Signed in User"})
    }
    }
catch(error){
res.status(500).json({message:"Error from get SignUp"})
}
}
export default getSignup;