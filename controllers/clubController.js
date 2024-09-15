const Club = require('../models/club');

const setClub = async (req, res) => {
  try {
    const { clubID, ...updateData } = req.body;

    // Use findOneAndUpdate with the upsert option to either update or create the document
    const club = await Club.findOneAndUpdate(
      { clubID }, // Search by clubID
      { $set: updateData }, // Update fields
      { new: true, upsert: true, runValidators: true } // Options: create new if not found, return updated doc, validate
    );

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