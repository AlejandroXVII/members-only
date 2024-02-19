const mongoose = require("mongoose");
const User = require("./user");

const Schema = mongoose.Schema;

const Message = mongoose.model(
	"message",
	new Schema({
		text: { type: String, required: true, maxLength: 200 },
		user: { type: Schema.Types.ObjectId, ref: User },
		date: { type: Date },
	})
);

module.exports = Message;
