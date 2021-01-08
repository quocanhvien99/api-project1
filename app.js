require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const passport = require('passport');
const passportSetup = require('./passport-setup');
const cookieSession = require('cookie-session');
const path = require('path');

//app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
	cookieSession({
		name: 'session',
		maxAge: 3600000,
		//sameSite: 'none',	//chạy ở cùng ip thì không cần
		//secure: true,
		keys: [process.env.TOKEN_SECRET],
	})
);
//initalize passport
app.use(passport.initialize());
app.use(passport.session());

//Import Routes
const userRoute = require('./routes/user');
const reportRoute = require('./routes/report');
const contentRoute = require('./routes/content');
const importantRoute = require('./routes/importantData');
const authRoute = require('./routes/auth');

const corsOptions = {
	origin: process.env.FRONTEND_URL,
	credentials: true,
};

//Connect to DB
mongoose.connect(
	process.env.DB_CONNECT,
	{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
	() => console.log('Connected to DB')
);

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//app.use(cookieParser());
app.use(cors(corsOptions));

//Route Middlewares
app.use('/api/user', userRoute);
app.use('/api/report', reportRoute);
app.use('/api/content', contentRoute);
app.use('/important', importantRoute);
app.use('/api/auth', authRoute);

app.get('/*', function (req, res) {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => console.log('Server is running!'));
