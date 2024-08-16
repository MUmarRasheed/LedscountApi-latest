const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');

router.post('/setClub', clubController.setClub);
router.get('/getClub/:clubID', clubController.getClub);
router.delete('/deleteClub/:clubID', clubController.deleteClub);

module.exports = router;
