const Joi = require('joi');

//Register Validation
const registerValidation = (data) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		email: Joi.string().max(255).required().email(),
		password: Joi.string().max(255).min(8).required(),
	});
	return schema.validate(data);
};

//Login Validation
const loginValidation = (data) => {
	const schema = Joi.object({
		email: Joi.string().max(255).required().email(),
		password: Joi.string().max(255).min(8).required(),
	});
	return schema.validate(data);
};

//Password Validation
const passwordValidation = (data) => {
	const schema = Joi.object({
		password: Joi.string().max(255).min(8).required(),
	});
	return schema.validate(data);
};

//Report Validation
const reportValidation = (data) => {
	const schema = Joi.object({
		name: Joi.string().max(50).min(5).required(),
		sex: Joi.string().max(3).min(2).required(),
		birthday: Joi.date().required(),
	});
	return schema.validate(data);
};

//Content Validation
const contentValidation = (data) => {
	const schema = Joi.object({
		content: Joi.string().required(),
		key: Joi.number().required(),
		number: Joi.number().required(),
	});
	return schema.validate(data);
};

//Update Content Validation
const updateContentValidation = (data) => {
	const schema = Joi.object({
		content: Joi.string().required(),
		number: Joi.number().required(),
		id: Joi.string().required(),
	});
	return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.passwordValidation = passwordValidation;
module.exports.reportValidation = reportValidation;
module.exports.contentValidation = contentValidation;
module.exports.updateContentValidation = updateContentValidation;
