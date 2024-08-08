const isAdmin= async (req,res,next)=>{

    try{

        if( await req.session.isAdmin){}
        else{
         return   res.redirect("/admin");
        }
        

    }catch(erorr){
        console.log(erorr);
    }

    next();
};


module.exports = {isAdmin}