const express = require("express");
const path = require("path");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const jokeRoutes = require("./routes/jokeRoutes");
const indexRoutes = require("./routes/indexRoutes");
const keys = require("./config/keys");
const cookieParser = require("cookie-parser");
const { checkUser } = require("./middleware/authMiddleware");
const session = require("express-session");
const flash = require("express-flash");

const port = process.env.PORT || 5000;
const app = express();

// Connect to MongoDB

const dbURI = keys.mongoDB.dbURI;
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) => {
    app.listen(port, () => {
      console.log(
        `MongoDB Connected and server is running and listening on port ${port}...`
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });

// EJS

app.set("view engine", "ejs");

// Middlewere

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: keys.session.secret,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(express.static(path.join(__dirname, "/public")));

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.warning_msg = req.flash("warning_msg");
  res.locals.info_msg = req.flash("info_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// Routes

app.use("*", checkUser);
app.use("/api/jokes", require("./routes/jokeRoutes"));
app.use("/", require("./routes/indexRoutes"));
app.use("/email", require("./routes/emailRoutes"));

// NodeMailer

app.post("/api/contact", async (req, res) => {
  const regex =
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  if (!regex.test(req.body.email)) {
    return res.send({ msg: "Please enter a valid email address" });
  }

  const output = `
        <h1>You have a new contact request</h1>
        <h2>Contact Details</h2>
        <ul>
            <li>Name: ${req.body.name}</li>
            <li>Email: ${req.body.email}</li>
        </ul>
        <h2>Message</h2>
        <p>${req.body.message}</p>
    `;

  const userOutput = `Hello ${req.body.name}, we have recieved your message. We will contact with you soon. Thank you for taking the time to contact us.`;

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

  // Send message to my Email
  let info = await transporter.sendMail({
    from: '"Lampropoulos Support" <support@lampropoulos.me>', // sender address
    to: "owner@api.com", // list of receivers
    subject: "Contact Form Submission", // Subject line
    html: output, // html body
  });

  info = await transporter.sendMail({
    from: '"Lampropoulos Support" <support@lampropoulos.me>', // sender address
    to: req.body.email, // list of receivers
    subject: "Contact Form Submission", // Subject line
    text: userOutput, // plain text body
  });

  //   console.log("Message sent: %s", info.messageId);
  //   console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  res.send("Email sent!");
});
