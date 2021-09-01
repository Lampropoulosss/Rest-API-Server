const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const User = require("../models/User");
const { jwtDecrypt } = require("jose/jwt/decrypt");
const crypto = require("crypto");

const requireAuth = async (req, res, next) => {
  const token = req.cookies.webToken;
  const secretKey = await crypto.createSecretKey(
    Buffer.from(keys.jwt.secretKey, "hex")
  );

  // Check jwt existance & verified status

  if (token) {
    try {
      const { payload, protectedHeader } = await jwtDecrypt(token, secretKey);

      console.log(payload);
      next();
    } catch (err) {
      if (err.code === "ERR_JWT_EXPIRED" || err.code === "ERR_JWE_INVALID") {
        res.cookie("webToken", "", { maxAge: 1 });
        return res.redirect("/login");
      }
      console.log(err);
    }
  } else {
    return res.redirect("/login");
  }
};

const requireNoAuth = (req, res, next) => {
  const token = req.cookies.webToken;

  // Check jwt existance

  if (!token) {
    next();
  } else {
    return res.redirect("/");
  }
};

// Check Current User

const checkUser = async (req, res, next) => {
  const token = req.cookies.webToken;
  const secretKey = await crypto.createSecretKey(
    Buffer.from(keys.jwt.secretKey, "hex")
  );

  if (token) {
    try {
      const { payload, protectedHeader } = await jwtDecrypt(token, secretKey);

      let user = await User.findById(payload.id);
      res.locals.user = user;
      next();
    } catch (err) {
      if (err.code === "ERR_JWT_EXPIRED" || err.code === "ERR_JWE_INVALID") {
        res.cookie("webToken", "", { maxAge: 1 });
        return res.redirect("/login");
      }
      console.log(err);
      res.locals.user = null;
      next();
    }
  } else {
    res.locals.user = null;
    next();
  }

  //       if (token) {
  //     jwt.verify(token, keys.jwt.secret, async (err, decodedToken) => {
  //       if (err) {
  //         res.locals.user = null;
  //         next();
  //       } else {
  //         let user = await User.findById(decodedToken.id);
  //         res.locals.user = user;
  //         next();
  //       }
  //     });
  //   } else {
  //     res.locals.user = null;
  //     next();
  //   }
};

module.exports = { requireAuth, requireNoAuth, checkUser };
