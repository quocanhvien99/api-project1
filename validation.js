const Joi = require('joi');

//Register Validation
const registerValidation = (data) => {
	const schema = Joi.object({
		name: Joi.string().required(),
		email: Joi.string().max(255).required().email(),
		password: Joi.string().max(255).min(8).required()
	});
	return schema.validate(data);
};

//Login Validation
const loginValidation = (data) => {
	const schema = Joi.object({
		email: Joi.string().max(255).required().email(),
		password: Joi.string().max(255).min(8).required()
	});
	return schema.validate(data);
};

//Password Validation
const passwordValidation = (data) => {
	const schema = Joi.object({
		password: Joi.string().max(255).min(8).required()
	});
	return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.passwordValidation = passwordValidation;
