require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');

//Import Routes
const userRoute = require('./routes/user');
const importantRoute = require('./routes/importantData');

const corsOptions = {
	origin: 'http://localhost:3000',
	credentials: true,
	methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
	allowedHeaders: 'Content-Type',
	preflightContinue: false,
	optionsSuccessStatus: 204
  }

//Connect to DB
mongoose.connect(
	process.env.DB_CONNECT,
	{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
	() => console.log('Connected to DB')
);

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());
app.use(cors(corsOptions));

//Route Middlewares
app.use('/api/user', userRoute);
app.use('/important', importantRoute);

app.get('/', (req, res) => {
	res.status(200).send('API Server');
})

app.listen(port, () => console.log('Server is running!'));
