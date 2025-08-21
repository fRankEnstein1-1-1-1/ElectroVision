import User from "../db/user_model";

const getSignup = (req,res)=>{
    try{
    const {name,email,password} = req.body;
    const exist = User.findOne({email,password});
    if(!exist){
        const newUser = new User({name,email,password}) ;
        newUser.save()
    }
    else{
        return res.staus(200).json({message:"Already a Signed in User"})
    }
    }
catch(error){
res.status(500).json({message:"Error from get SignUp"})
}
}
export default getSignup;