const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
	content: String,
	number: String,
	key: String
})

const reportSchema = new mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	sex: {
		type: String,
		require: true
	},
	birthday: {
		type: Date,
		require: true
	},
	content: [contentSchema],
	userId: {
		type: String,
		require: true
	},
	date: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('reports', reportSchema);
