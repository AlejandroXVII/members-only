var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./models/user");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const navigationRouter = require("./routes/navigation");

var app = express();

const mongoDb = process.env.MONGODB_URL;
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/users", usersRouter);

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});
/*
app.get("/", (req, res) => {
	res.render("index", { user: req.user });
});*/
app.use("/", navigationRouter); // Add catalog routes to middleware chain.
app.get("/sign-up", (req, res) => res.render("sign-up-form"));

app.post("/sign-up", async (req, res, next) => {
	bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
		// if err, do something
		// otherwise, store hashedPassword in DB
		if (err || req.body.password !== req.body.confirm_password) {
			return next(err);
		} else {
			const user = new User({
				first_name: req.body.first_name,
				last_name: req.body.last_name,
				username: req.body.username,
				password: hashedPassword,
				admin_status: req.body.admin_status === "on" ? true : false,
				member_status: false,
			});
			const result = await user.save();
			res.redirect("/");
		}
	});
});

app.post(
	"/log-in",
	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/",
	})
);

app.get("/log-out", (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(err);
		}
		res.redirect("/");
	});
});

passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			const user = await User.findOne({ username: username });
			if (!user) {
				return done(null, false, { message: "Incorrect username" });
			}
			const match = await bcrypt.compare(password, user.password);
			if (!match) {
				// passwords do not match!
				return done(null, false, { message: "Incorrect password" });
			}
			return done(null, user);
		} catch (err) {
			return done(err);
		}
	})
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await User.findById(id);
		done(null, user);
	} catch (err) {
		done(err);
	}
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
