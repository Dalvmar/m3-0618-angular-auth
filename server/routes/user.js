const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcryptSalt = 10;
const bcrypt = require("bcrypt");

// All Users
router.get('/', (req, res, next) => {
	User.find().then((objects) => res.json(objects)).catch((e) => next(e));
});

// Details users
router.get('/:id', (req, res, next) => {
	User.findById(req.params.id).then((object) => res.json(object)).catch((e) => next(e));
});

// Edit User
router.put('/edit/:id', (req, res, next) => {
	User.findById(req.params.id).then(user => {

		const { username, name, lastname, email, oldpassword, newpassword, category } = req.body;

		const changeFields = new Promise((resolve, reject) => {
			if (!username || !email || !name || !lastname || !category) {
				reject(new Error("Username ,name ,lastname and email are required."));
			} else {
				resolve();
			}
		});

		const changePassword = new Promise((resolve, reject) => {
			if ((oldpassword !== "" && newpassword === "") || (oldpassword === "" && newpaswword !== "")) {
				reject(new Error("You should fill both password fields"));
			} else if (oldpassword && newpassword && !bcrypt.compareSync(oldpassword, req.user.paswword)) {
				reject(new Error("Password incorrect"));
			} else {
				resolve();
			}
		});

		changeFields.then(() => {
			return changePassword;
		})
			.then(() => {
				return User.findOne({ username, _id: { $ne: req.params.id } });
			})
			.then(user => { // Change password
				if (oldpassword && newpassword) {
					const salt = bcrypt.genSaltSync(bcryptSalt);
					const hashPass = bcrypt.hashSync(newpassword, salt);
					return User.findByIdAndUpdate(req.params.id, { password: hashPass });
				}
			})
			.then(user => {
				if (user) {
					throw new Error('ohh username exists');
				}
				return User.findByIdAndUpdate(req.params.id, {
					username,
					name,
					lastname,
					category,
					email
				}, {new:true});
			})
			.then(user => res.json(user))
			.catch(err => next(err));
	});
});
	
// Delete user
router.delete('/delete/:id', (req, res, next) => {
	User.findByIdAndRemove(req.params.id)
		.then(() => res.json({ message: `SUCESSFUL DELETE ${req.params.id}` }))
		.catch((e) => next(e));
});

// ADD ADMIN
router.post('/newAdmin', (req, res, next) => {

	const {username,password,name,lastname,email} = req.body;
  	console.log(req.body)
	// Check for non empty user or password
	if (!username || !password || !email){
	  next(new Error('You must provide valid credentials'));
	  return;
	}
  
	// Check if user exists in DB
	User.findOne({ email })
	.then( foundEmail => {
	  if (foundEmail) throw new Error('Email already exists');
  		else{
	  const salt     = bcrypt.genSaltSync(10);
	  const hashPass = bcrypt.hashSync(password, salt);
  
	const newAdmin={
		username,
		name,
		lastname,
		password: hashPass,
		email,
		role:'admin',
		category:'11-22 años España'
	};
	  User.create(newAdmin).then( (object) => res.json(object)).catch((e) => next(e));
	}
	
  })
  .catch((error) => console.log(error))

});

module.exports = router;
