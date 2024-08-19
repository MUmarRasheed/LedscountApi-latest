const Device = require('../models/device');

const setDevice = async (req, res) => {
  try {
    const device = new Device(req.body);
    await device.save();
    res.status(201).send(device);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getDevice = async (req, res) => {
  try {
    const device = await Device.findOne({ deviceID: req.params.deviceID },{ deviceID: 1, clubID: 1, courtNumber: 1, firmwareVersion: 1 });
    if (!device) {
      return res.status(404).send({message: "device not found"});
    }
    res.send(device);
  } catch (error) {
    res.status(500).send(error);
  }
};

const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndDelete({ deviceID: req.params.deviceID });
    if (!device) {
     return res.status(404).send({message: "device not found"});
    }
    res.send(device);
  } catch (error) {
    res.status(500).send(error);
  }
};

const setMatchSettings = async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { deviceID: req.body.deviceID },
      { testMode: req.body.testMode, matchSettings: req.body.matchSettings },
      { new: true }
    );
    if (!device) {
        return res.status(404).send({ message: "device not found"});
    }

    res.send(device);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getMatchSettings = async (req, res) => {
  try {
    const device = await Device.findOne({ deviceID: req.params.deviceID });
    if (!device) {
        return res.status(404).send({message: "device not found"});
    }
    res.send({ deviceID: device.deviceID, courtNumber:device.courtNumber,testMode: device.testMode, matchSettings: device.matchSettings });
  } catch (error) {
    res.status(500).send(error);
  }
};

const setScore = async (req, res) => {
  try {
    const device = await Device.findOneAndUpdate(
      { deviceID: req.body.deviceID },
      { matchScore: req.body.matchScore },
      { new: true }
    );
    if (!device) {
        return res.status(404).send({message: "device not found"});
    }

    res.send(device);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getMatches = async (req, res) => {
    try {
        const { clubID, deviceID, playing } = req.query;
        const query = {};

        if (clubID) query.clubID = clubID;
        if (deviceID) query.deviceID = deviceID;
        if (playing) query['matchScore.playing'] = playing === 'true';

        const matches = await Device.find(query)
        .select({
            _id: 0, // Exclude the _id field
            deviceID: 1,
            clubID: 1,
            courtNumber: 1,
            matchSettings: {
                goldenBallMode: 1,
                tieBreakMode: 1,
                tieBreakGames: 1,
                setsToWinMatch: 1,
                sound: 1
            },
            matchScore: {
                playing: 1,
                started: 1,
                lastPointMade: 1,
                teamServing: 1,
                score: 1
            }
        });

        if (matches.length === 0) {
            return res.status(404).json({ message: "No matches found" });
        }

        res.status(200).json({ matches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getMatchSettings, setMatchSettings, setDevice, getDevice , getMatches, deleteDevice, setScore }
