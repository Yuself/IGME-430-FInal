const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

// Domo B
const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, doc) => {
    if (err) {
      return res.status(500).json({ error: 'An error occurred.' });
    }

    if (!doc) {
      return res.status(401).json({ error: 'Wrong username or password.' });
    }
    
    // Demo B
    req.session.account = Account.toAPI(doc);

    return res.json({ redirect: '/maker' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }


  //demo b
try {
    const hash = await Account.generateHash(pass);

    const accountData = new Account({
      username,
      password: hash,
    });

    const newAccount = await accountData.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/maker' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use.' });
    }

    return res.status(500).json({ error: 'An error occurred.' });
  }
};

module.exports = {
  loginPage,
  logout,
  login,
  signup,
};