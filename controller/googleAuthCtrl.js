const User = require("../models/userModel");
const Otp = require("../models/otpmodel");
const Cart = require("../models/cartModel");
const Recoverypassword = require("../models/recoveryPasswordmodel");
const Product = require("../models/productmodel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const nocache = require('nocache');
const Category = require("../models/categorymodel");
const mail = require("../middleware/mail")
const otpGenerator = require('otp-generator');
const passport = require("passport");
const Oauth2Strategy = require("passport-google-oauth2").Strategy;


// Initialize passport strategy
passport.use(
    new Oauth2Strategy({
        clientID : process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"]
    },
    async (request, accessToken, refreshToken, profile, done) => {
        try {
            console.log("user profile is " + profile.id);

            let checkUser = await User.findOne({ googleId: profile.id }); 

            if (!checkUser) {
                let emailTest = await User.findOne({ email: profile.emails[0].value });

                if (emailTest) {
                    await User.updateOne({ email: emailTest.email }, { $set: { googleId: profile.id } });
                    await User.updateOne({ email: emailTest.email }, { $set: { is_verified: 1 } });

                    done(null, emailTest);
                } else {
                    const user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        password: profile.id,
                        googleId: profile.id,
                        is_verified: 1,
                    });

                    await user.save();
                    done(null, user);
                }
            } else {
                done(null, checkUser);
            }
        } catch (error) {
            console.log(error);
            return done(error, null);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Google authentication controller
const googleAuth  = {
    authenticate: passport.authenticate("google", { scope: ["profile", "email"] }),

    callback: (req, res, next) => {
        passport.authenticate("google", (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect("https://www.brandhome.shop/login");
            }
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                // Store user email in session
                req.session.user = user.email;
                req.session.user_id = user.email;
                req.session.isUser = true;

                // Optionally set cache control headers
                res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                res.set('Expires', '-1');
                res.set('Pragma', 'no-cache');
                
                return res.redirect("https://www.brandhome.shop/home");
            });
        })(req, res, next);
    }
};


module.exports = {
    googleAuth,
}