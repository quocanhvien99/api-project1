const mongoose = require('mongoose');

const descriptionSchema = new mongoose.Schema({
	content: {
		type: String
	},
	index: {
		type: Number,
		require: true
	},
	date: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('descriptions', descriptionSchema);
