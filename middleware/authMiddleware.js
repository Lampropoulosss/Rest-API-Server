const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const User = require("../models/User");

const requireAuth = (req, res, next) => {
    const token = req.cookies.webToken;

    // Check jwt existance & verified status

    if(token) {
        jwt.verify(token, keys.jwt.secret), (err, decodedToken) => {
            if(err) {
                res.redirect("/login");
            } else {
                next();
            };
        };
    } else {
         return res.redirect("/login");
    };

    next();
};

const requireNoAuth = (req, res, next) => {
    const token = req.cookies.webToken;

    // Check jwt existance

    if(!token) {
        next();
    } else {
         return res.redirect("/");
    };
};

// Check Current User

const checkUser = (req, res, next) => {
    const token = req.cookies.webToken;
    if(token) {
        jwt.verify(token, keys.jwt.secret, async (err, decodedToken) => {
            if(err) {
                res.locals.user = null;
                next();
            } else {
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            };
        });
    } else {
        res.locals.user = null;
        next();
    };
};

module.exports = { requireAuth, requireNoAuth, checkUser };