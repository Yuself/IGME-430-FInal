const models = require('../models');

const { Domo } = models;
// changed during domo d
const makerPage = (req, res) => res.render('app');

const makeDomo = async (req, res) => {
  const domoName = `${req.body.name}`;
  const domoAge = `${req.body.age}`;
  const domoLevel = `${req.body.level}`;

  if (!domoName || !domoAge || !domoLevel) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  const domoData = {
    name: domoName,
    age: domoAge,
    level: domoLevel,
    owner: req.session.account._id,
  };

  try {
    const newDomo = new Domo(domoData);
    await newDomo.save();
    // Return success without redirect to avoid full page reload
    return res.status(201).json({
      name: newDomo.name,
      age: newDomo.age,
      level: newDomo.level,
    });
  } catch {
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

const getDomos = async (req, res) => {
  try {
    const docs = await Domo.find({ owner: req.session.account._id })
      .select('name age level _id')
      .lean()
      .exec();

    // Return domos as JSON for React to render
    return res.json({ domos: docs });
  } catch {
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

/* Deletes a domo that belongs to the current user */
const deleteDomo = async (req, res) => {
  const domoId = `${req.body.id}`;

  if (!domoId) {
    return res.status(400).json({ error: 'Domo id is required!' });
  }

  try {
    const deletedDomo = await Domo.findOneAndDelete({
      _id: domoId,
      owner: req.session.account._id,
    });

    if (!deletedDomo) {
      return res.status(404).json({ error: 'Domo not found!' });
    }

    return res.json({ message: 'Domo deleted!' });
  } catch {
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

module.exports = {
  makerPage,
  makeDomo,
  getDomos,
  deleteDomo,
};
