const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	email: {
		type: String,
		require: true
	},
	password: {
		type: String,
		require: true,
		max: 255,
		min: 8
	},
	isAdmin: {
		type: Boolean,
		default: false
	},
	date: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('users', userSchema);
