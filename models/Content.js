const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
	content: {
		type: String
	},
	number: {
		type: String,
		require: true
    },
    key: {
		type: String,
		require: true
	},
	date: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('content', contentSchema);
