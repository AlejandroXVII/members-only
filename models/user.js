const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const User = mongoose.model(
	"user",
	new Schema({
		first_name: { type: String, required: true },
		last_name: { type: String, required: true },
		username: { type: String, required: true },
		password: { type: String, required: true },
		admin_status: { type: Boolean },
		member_status: { type: Boolean },
	})
);

module.exports = User;
