const mongoose = require("mongoose");
const User = require("./user");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
	text: { type: String, required: true, maxLength: 200 },
	user: { type: Schema.Types.ObjectId, ref: User },
	date: { type: Date },
});

messageSchema.virtual("url").get(function () {
	// We don't use an arrow function as we'll need the this object
	return `/${this._id}`;
});

module.exports = mongoose.model("message", messageSchema);
