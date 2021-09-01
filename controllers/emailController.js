const User = require("../models/User");
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");
const nodemailer = require("nodemailer");

// NodeMailer

sendVerificationEmail = async (emailToken, emailAddress) => {
  const userOutput = `
        <h1>Please verify your email address to continue</h1>
        <p>Use the following link to verify your email address</p>
        <a href="${keys.domain.name}/email/verification/${emailToken}">${keys.domain.name}/email/verification/${emailToken}</a>
        <p>Your account will be deleted within the next 10 minutes if the email verification will not proceed</p>
        `;

  let transporter = nodemailer.createTransport({
    host: keys.smtp.host,
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: keys.smtp.user, // generated ethereal user
      pass: keys.smtp.pass, // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Send message to my Email
    let info = await transporter.sendMail({
      from: '"Email Verification" <noreply@lampropoulos.me>', // sender address
      to: emailAddress, // list of receivers
      subject: "NoReply", // Subject line
      html: userOutput, // html body
    });

    return true;
  } catch (err) {
    console.log(err.message);
    return false;
  }

  //   console.log("Message sent: %s", info.messageId);
  //   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};

const verification_get = (req, res) => {
  const token = req.params.token;
  jwt.verify(token, keys.jwt.emailSecret, async (err, decodedToken) => {
    if (err) {
      if (err.message === "jwt expired") {
        return res.render("emailVerify", {
          title: "Email Verification",
          message: "The verification link expired",
        });
      }
      if (err.message === "jwt malformed") {
        return res.render("emailVerify", {
          title: "Email Verification",
          message: "The verification link is not correct",
        });
      }
    } else {
      const user = await User.findById(decodedToken.id);
      if (user.verified === true) {
        return res.render("emailVerify", {
          title: "Email Verification",
          message: "Your account has already been verified",
        });
      }
      if (user) {
        await User.updateOne(
          { email: user.email },
          { $set: { verified: true } }
        );
        return res.render("emailVerify", {
          title: "Email Verification",
          message: "Your account has been verified successfully",
        });
      } else {
        return res.render("emailVerify", {
          title: "Email Verification",
          message: "User could not be found",
        });
      }
    }
  });
};

module.exports = {
  sendVerificationEmail,
  verification_get,
};
