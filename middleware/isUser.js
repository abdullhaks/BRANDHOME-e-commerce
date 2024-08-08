const isUser= async (req,res,next)=>{

    try{

        if( await req.session.isUser){}
        else{
         return   res.redirect("/admin");
        }
        

    }catch(erorr){
        console.log(erorr);
    }

    next();
};


module.exports = {isUser} 