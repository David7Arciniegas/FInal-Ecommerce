const path = require('path');

// Models
const { Users } = require('../models/users.model');


// Utils
const { catchAsync } = require('../utils/catchAsync.util');

const renderIndex = catchAsync(async (req, res, next) => {
	const users = await Users.findAll();
	

	res.status(200).render('index', {
		username: 'Rendered with Pug',
		users,
	});

	

	// Serve static html
	// const indexPath = path.join(__dirname, '..', 'public', 'index.html');

	// res.status(200).sendFile(indexPath);
});

module.exports = { renderIndex };
