const express = require('express');
const User = require('../models/user');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

// Image upload configuration
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});
var upload = multer({
    storage: storage,
}).single('image');

// Insert a user into the database
router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
        });

        await user.save();

        req.session.message = {
            type: 'success',
            message: 'User added successfully'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Get all users route
router.get('/', (req, res) => {
    User.find().exec()
        .then(users => {
            res.render("index", {
                title: "Home Page",
                users: users,
            });
        })
        .catch(err => {
            res.json({ message: err.message });
        });
});

router.get('/', (req, res) => {
    res.render('index', { title: 'Home Page' });
});

router.get('/add', (req, res) => {
    res.render('add_user', { title: 'Add User' });
});

router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).exec();
        if (!user) {
            return res.redirect('/');
        }
        res.render('edit_user', {
            title: 'Edit User',
            user: user,
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.post('/update/:id', upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';
        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync('./uploads/' + req.body.old_image);
            } catch (err) {
                console.error(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        }).exec();

        if (!result) {
            return res.json({ message: 'User not found', type: 'danger' });
        }

        req.session.message = {
            type: 'success',
            message: 'User updated successfully'
        };
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.json({ message: err.message, type: 'danger' });
    }
});

// Delete user route
router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByIdAndDelete(id).exec();
        if (user) {
            try {
                fs.unlinkSync('./uploads/' + user.image);
            } catch (err) {
                console.error(err);
            }
            req.session.message = {
                type: 'success',
                message: 'User deleted successfully'
            };
        } else {
            req.session.message = {
                type: 'danger',
                message: 'User not found'
            };
        }
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.json({ message: err.message, type: 'danger' });
    }
});

module.exports = router;