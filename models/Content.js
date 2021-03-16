const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
	content: {
		type: String,
	},
	number: {
		type: Number,
		require: true,
	},
	key: {
		type: Number,
		require: true,
	},
	date: {
		type: Date,
		default: Date.now(),
	},
});

module.exports = mongoose.model('content', contentSchema);
