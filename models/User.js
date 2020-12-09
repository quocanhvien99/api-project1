const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	fbid: {
		type: String
	},
	email: {
		type: String
	},
	password: {
		type: String,
		max: 255,
		min: 7
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
