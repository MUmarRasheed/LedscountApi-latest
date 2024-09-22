const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

router.post('/setDevice', deviceController.setDevice);
router.get('/getDevice/:deviceID', deviceController.getDevice);
router.delete('/deleteDevice/:deviceID', deviceController.deleteDevice);
router.post('/setMatchSettings', deviceController.setMatchSettings);
router.get('/getMatchSettings/:deviceID', deviceController.getMatchSettings);
router.post('/setScore', deviceController.setScore);
router.get('/getMatches', deviceController.getMatches);
router.get('/getDevices', deviceController.getClubsAndCourts);

module.exports = router;
