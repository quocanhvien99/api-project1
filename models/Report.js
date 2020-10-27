const mongoose = require('mongoose');

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
	content: {
		type: String,
		require: true
	},
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
