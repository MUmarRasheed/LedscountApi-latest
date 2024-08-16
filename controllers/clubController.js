const Club = require('../models/club');

const setClub = async (req, res) => {
  try {
    const club = new Club(req.body);
    await club.save();
    res.status(201).send(club);
  } catch (error) {
    res.status(400).send(error);
  }
};

const getClub = async (req, res) => {
  try {
    const club = await Club.findOne({ clubID: req.params.clubID });
    if (!club) {
      return res.status(404).send({message: "club not found"});
    }
    res.send(club);
  } catch (error) {
    res.status(500).send(error);
  }
};

const deleteClub = async (req, res) => {
  try {
    const club = await Club.findOneAndDelete({ clubID: req.params.clubID });
    if (!club) {
        return res.status(404).send({ message: "club not found" });
    }
    res.send(club);
  } catch (error) {
    res.status(500).send(error);
  }
};
 
module.exports = { setClub, getClub, deleteClub }