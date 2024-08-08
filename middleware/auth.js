const isLogin = async (req,res,next)=>{

    try{

        if( await req.session.user_id){}
        else{
         return   res.redirect("/login");
        }
        

    }catch(erorr){
        console.log(erorr);
    }

    next();
};


const isLogout = async (req,res,next)=>{

    try{

        if(await req.session.user_id){
         return   res.redirect("/home")
        }

        
    }catch(erorr){
        console.log(erorr);
    }

    next();
};



module.exports = {isLogin,isLogout};





