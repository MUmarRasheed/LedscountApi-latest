const Device = require('../models/device');
const Club = require('../models/club')

const setDevice = async (req, res) => {
  try {
    const { deviceID } = req.body;

    // Validate deviceID is provided
    if (!deviceID) {
      return res.status(400).send({ error: 'deviceID is required' });
    }

    // Find and update the device, or create a new one if it doesn't exist
    const device = await Device.findOneAndUpdate(
      { deviceID }, // Query to find the device by deviceID
      req.body, // The fields to update
      { 
        new: true, // Return the updated document
        upsert: true, // Create the document if it doesn't exist
        runValidators: true // Ensure validators are run on the update
      }
    );

    res.status(200).send(device);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const getDevice = async (req, res) => {
  try {
    const device = await Device.findOne(
      { deviceID: req.params.deviceID },
      { deviceID: 1, clubID: 1, courtNumber: 1, firmwareVersion: 1, lastSeen: 1 } // Include lastSeen in the response
    );
    if (!device) {
      return res.status(404).send({ message: "Device not found" });
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
      { 
        testMode: req.body.testMode, 
        matchSettings: {
          ...req.body.matchSettings,
          language: req.body.matchSettings.language // Ensure language is included
        } 
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).send({ message: "Device not found" });
    }

    // Send a minimal response for a successful operation
    res.send({ status: "success" });
  } catch (error) {
    // Send the error as is for an unsuccessful operation
    res.status(400).send(error);
  }
};

const getMatchSettings = async (req, res) => {
  try {
    const device = await Device.findOne({ deviceID: req.params.deviceID });

    if (!device) {
      return res.status(404).send({ message: "device not found"});
    }

    // Check if the game is not playing and reset the score
    if (!device.matchScore.playing) {
      // Reset the score to empty state
      device.matchScore.score = []; // Clear the score
      device.matchScore.teamServing = null; // Optionally clear the team serving
    }

    res.send({ 
      deviceID: device.deviceID, 
      courtNumber: device.courtNumber, 
      testMode: device.testMode,
      matchSettings: device.matchSettings,
      matchScore: device.matchScore // Include the reset score in the response
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

const setScore = async (req, res) => {
  try {
    const { deviceID, matchScore } = req.body;

    // Check if a device exists
    const device = await Device.findOne({ deviceID });
    if (!device) {
      return res.status(404).send({ message: "Device not found" });
    }

    // Prepare update fields
    const updateFields = {
      'matchScore.playing': matchScore.playing,
      'matchScore.teamServing': matchScore.teamServing,
      'matchScore.score': matchScore.score,
      'matchScore.temperature': matchScore.temperature,
      'matchScore.lastPointMade': new Date(), // Update lastPointMade to current time
      'lastSeen': new Date() // Also update the lastSeen timestamp to reset the heartbeat timer
    };

    // If the match is no longer playing, set the 'started' field if not already set
    if (matchScore.playing === false) {
      if (!device.matchScore.started) {
        // If started is not set, set it to the current time
        updateFields['matchScore.started'] = new Date();
      }
    }

    // Update the device
    const updatedDevice = await Device.findOneAndUpdate(
      { deviceID },
      { $set: updateFields },
      { new: true }
    );

    res.send({ status: 'success' });
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
                sound: 1,
                language: 1 // Include language in the selection
            },
            matchScore: {
                playing: 1,
                started: 1,
                lastPointMade: 1,
                teamServing: 1,
                score: 1,
                temperature: 1
            }
        })

        if (matches.length === 0) {
            return res.status(404).json({ message: "No matches found" });
        }
        // Convert courtNumber to number and sort in JavaScript
        matches.sort((a, b) => {
          const numA = parseFloat(a.courtNumber);
          const numB = parseFloat(b.courtNumber);
          return numA - numB;
        });
        res.status(200).json({ matches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getClubsAndCourts = async (req, res) => {
  try {
    const { clubID, deviceID, firmwareVersion } = req.query;
    const query = {};

    // Building query conditions based on the input parameters
    if (clubID) query["clubID"] = clubID;
    if (deviceID) query["courts.deviceID"] = deviceID;
    if (firmwareVersion) query["courts.firmwareVersion"] = firmwareVersion;

    // Aggregating clubs and their courts
    const clubs = await Club.aggregate([
      {
        $lookup: {
          from: 'devices', // Assuming 'devices' is the collection for devices
          localField: 'clubID',
          foreignField: 'clubID',
          as: 'courts'
        }
      },
      {
        $match: query // Apply the filters
      },
      {
        $addFields: {
          club: {
            clubID: "$clubID",
            clubName: "$clubName",
            clubCity: "$clubCity",
            hubID: "$hubID",
            courts: "$courts"
          }
        }
      },
      {
        $project: {
          _id: 0, // Exclude _id
          club: {
            clubID: 1,
            clubName: 1,
            clubCity: 1,
            hubID: 1,
            courts: {
              $map: {
                input: "$courts",
                as: "court",
                in: {
                  deviceID: "$$court.deviceID",
                  courtNumber: "$$court.courtNumber",
                  firmwareVersion: "$$court.firmwareVersion"
                }
              }
            }
          }
        }
      }
    ]);

    // If no clubs are found
    if (clubs.length === 0) {
      return res.status(404).json({ message: "No clubs found" });
    }

    // Sorting by clubName ASC
    clubs.sort((a, b) => {
      const clubNameA = a.club.clubName ? a.club.clubName.toLowerCase() : '';
      const clubNameB = b.club.clubName ? b.club.clubName.toLowerCase() : '';
      return clubNameA.localeCompare(clubNameB);
    });

    // Sort courts within each club by courtNumber ASC
    clubs.forEach(club => {
      club.club.courts.sort((courtA, courtB) => {
        return parseInt(courtA.courtNumber) - parseInt(courtB.courtNumber);
      });
    });

    res.status(200).json({ clubs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const setHeartBeat = async (req, res) => {
  try {
    const { deviceID } = req.query; // Using query parameters for GET

    // Validate deviceID is provided
    if (!deviceID) {
      return res.status(400).send({ error: 'deviceID is required' });
    }

    // Update lastSeen timestamp for the device
    const device = await Device.findOneAndUpdate(
      { deviceID },
      { lastSeen: new Date() }, // Update lastSeen with current timestamp
      { new: true }
    );

    if (!device) {
      return res.status(404).send({ message: 'Device not found' });
    }

    res.status(200).send({ status: 'success' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

module.exports = { getMatchSettings, setMatchSettings, setDevice, getDevice, getMatches, deleteDevice, setScore, getClubsAndCourts, setHeartBeat };
