const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const Message = require("../models/message");

exports.index = asyncHandler(async (req, res, next) => {
	const messages = await Message.find({}).populate("user");
	res.render("index", { title: "index", messages: messages });
});

exports.user_join_members_get = asyncHandler(async (req, res, next) => {
	res.render("join-to-members", { title: "Join to members" });
});
exports.user_join_members_post = [
	// Validate and sanitize the name field.
	body("secretWord").custom((value, { req }) => {
		return value === "join";
	}),

	// Process request after validation and sanitization.
	asyncHandler(async (req, res, next) => {
		// Extract the validation errors from a request .
		const errors = validationResult(req);

		// Create a category object with escaped and trimmed data (and the old id!)
		const user = new User({
			first_name: req.params.first_name,
			last_name: req.params.last_name,
			username: req.params.username,
			password: req.params.password,
			admin_status: req.params.admin_status,
			member_status: true,
			_id: req.body.current,
		});

		if (!errors.isEmpty()) {
			// There are errors. Render the form again with sanitized values and error messages.
			res.render("join-to-members", {
				title: "Join members",
				user: user,
				errors: errors.array(),
			});
			return;
		} else {
			// Data from form is valid. Update the record.
			await User.findByIdAndUpdate(req.body.current, user);
			res.redirect("/");
		}
	}),
];
exports.user_create_message_get = asyncHandler(async (req, res, next) => {
	res.render("create-new-message", { title: "New message" });
});
exports.user_create_message_post = [
	// Validate and sanitize fields.
	body("message", "message must be specified")
		.trim()
		.isLength({ min: 1 })
		.escape(),

	// Process request after validation and sanitization.
	asyncHandler(async (req, res, next) => {
		// Extract the validation errors from a request.
		const errors = validationResult(req);

		// Create a BookInstance object with escaped and trimmed data.
		const message = new Message({
			text: req.body.message,
			user: req.body.current,
			date: new Date(),
		});

		if (!errors.isEmpty()) {
			res.render("create-new-message", {
				title: "New message",
			});
			return;
		} else {
			// Data from form is valid
			await message.save();
			res.redirect("/");
		}
	}),
];

exports.user_delate_message_get = asyncHandler(async (req, res, next) => {
	const message = await Message.findById(req.params.id).exec();

	res.render("delate-message", { title: "Delate message", message: message });
});

exports.user_delate_message_post = asyncHandler(async (req, res, next) => {
	await Message.findByIdAndDelete(req.body.messageRid);
	res.redirect("/");
});
