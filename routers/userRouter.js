const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');

router.get('/', userController.getUsers);

module.exports = router;