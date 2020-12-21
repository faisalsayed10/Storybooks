const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const passport = require("passport");
const morgan = require("morgan");
const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const methodOverride = require('method-override')
const session = require("express-session");
const connectDB = require("./config/db");
const MongoStore = require("connect-mongo")(session);

dotenv.config({ path: "./config/config.env" });
require("./config/passport")(passport);

connectDB();

const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override

app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    let method = req.body._method
    delete req.body._method
    return method;
  }
}))

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const { formatDate, stripTags, truncate, editIcon, select } = require("./helpers/hbs");

// Handlebars
app.engine(
  ".hbs",
  exphbs({ helpers: { formatDate, stripTags, truncate, editIcon, select }, extname: ".hbs", defaultLayout: "main" })
);
app.set("view engine", ".hbs");

// Sessions
app.use(
  session({
    secret: "harry potter",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport middlwares
app.use(passport.initialize());
app.use(passport.session());

// Global Variables
app.use((req, res, next) => {
  res.locals.user = req.user || null
  next();
})

// Static Folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/stories", require("./routes/stories"));

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
