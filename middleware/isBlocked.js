const User = require("../models/userModel");




const isBlocked = async(req,res,next)=>{

    try{
        var email = req.session.user;
        const users = await User.find({ email: email });

        if (users.length === 0) {
            throw new Error("User not found");
        }

        const user = users[0];

        console.log("user is_blocked: ", user.is_blocked);

       

        if(user.is_blocked==1){
            
            var emailErrors = [];
            var passwordErrors =[];
            var password =""

            req.session.destroy();

            res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
            res.set('Expires', '-1');
            res.set('Pragma', 'no-cache');

            emailErrors.push({ msg: "this account is blocked  " });
           return res.render("login",{emailErrors,passwordErrors,  email:email, password:password});
    
          
    
        }

    }catch(error){
        console.log(error);
    };

    next();
  


};

module.exports = {
    isBlocked
}