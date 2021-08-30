const User = require("../models/User");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const { sendVerificationEmail } = require("./emailController");

// Handle Errors

const handleErrors = (err) => {
    let errors = { name: "", email: "", password: "" }

    // Incorrect Email
    if (err.message === "incorrect email") {
        errors.email = "That email is not registered";
    };

    if (err.message === "incorrect password") {
        errors.password = "That password is incorrect";
    };

    // Duplicate Error Code

    if (err.code === 11000) {
        errors.email = "That email is already registered";
        return errors;
    }

    // Validation Errors

    if (err.message.includes("User validation failed")) {
        Object.values(err.errors).forEach(({ properties }) => {
            errors[properties.path] = properties.message;
        });
    }

    return errors;

};

// Create Token

const maxAge = 7 * 24 * 60 * 60;

const createToken = (id) => {
    return jwt.sign({ id }, keys.jwt.secret, {
        expiresIn: maxAge
    });
};

const createEmailToken = (id) => {
    return jwt.sign({ id }, keys.jwt.emailSecret, {
        expiresIn: 10 * 60
    });
};

const index_get = (req, res) => {
    res.render("welcome", {
        title: "Home"
    });
};

const login_get = (req, res) => {
    res.render("login", {
        title: "Login"
    });
};

const register_get = (req, res) => {
    res.render("register", {
        title: "Register"
    });
};
const login_post = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie("webToken", token, { httpOnly: true, maxAge: maxAge * 1000 });
        req.flash("success_msg", "You have successfully logged in");
        res.status(201).json({ user: user._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

const register_post = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let user = await User.create({ name, email, password })
        const token = createToken(user._id);
        const emailToken = createEmailToken(user._id);
        const emailResult = sendVerificationEmail(emailToken, user.email);
        if(emailResult) {
            res.cookie("webToken", token, { httpOnly: true, maxAge: maxAge * 1000 });
            req.flash("info_msg", "Please confirm your email");
            res.status(201).json({ user: user._id });
            setTimeout(async () => {
               const userChecked =  await User.findOne({ _id: user._id  });
               if(userChecked.verified !== true) {
                   return await User.deleteOne({ _id: user._id });
               };
            }, 600000);
        } else {
            console.log("There was an error with the Nodemailer package");
        };
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
};

const logout_get = (req, res) => {
    res.cookie("webToken", "", { maxAge: 1 });
    req.flash("success_msg", "You have successfully logged out");
    res.redirect("/");
};

module.exports = {
    index_get,
    login_get,
    register_get,
    login_post,
    register_post,
    logout_get
};