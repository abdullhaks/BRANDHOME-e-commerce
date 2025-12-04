const isLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

const isLogout = (req, res, next) => {
  if (req.session.user_id) {
    return res.redirect("/home");
  }
  next();
};


module.exports = {isLogin,isLogout};





