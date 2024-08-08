const isLogin = async (req,res,next)=>{

    try{

        if(  req.session.admin_Id){ }
        else{
            return res.redirect("/admin");
        }
        next();

    }catch(error){
        console.log(erorr);
    }
};


const isLogout = async (req,res,next)=>{

    try{

        if( req.session.admin_Id){
          return  res.redirect("/admin/home")
        }

        next();
    }catch(error){
        console.log(erorr);
    }
};


module.exports = {isLogin,isLogout}