const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

const premiumDurations = {
  hourly: 60 * 60 * 1000,
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000,
};

const getPremiumStatus = (account) => {
  const expiresAt = account.premiumExpiresAt;
  const isPremium = Boolean(expiresAt && expiresAt > new Date());

  return {
    username: account.username,
    premiumTier: isPremium ? account.premiumTier : 'free',
    premiumExpiresAt: isPremium ? expiresAt : null,
    isPremium,
  };
};

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

const changePassword = (req, res) => {
  const currentPass = `${req.body.currentPass || ''}`;
  const newPass = `${req.body.newPass || ''}`;
  const newPass2 = `${req.body.newPass2 || ''}`;

  if (!currentPass || !newPass || !newPass2) {
    return res.status(400).json({ error: 'All password fields are required.' });
  }

  if (newPass !== newPass2) {
    return res.status(400).json({ error: 'New passwords do not match.' });
  }

  if (newPass.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters.' });
  }

  if (currentPass === newPass) {
    return res.status(400).json({ error: 'New password must be different from current password.' });
  }

  if (!req.session.account || !req.session.account.username) {
    return res.status(401).json({ error: 'You must be logged in to change your password.' });
  }

  return Account.authenticate(req.session.account.username, currentPass, async (err, doc) => {
    if (err) {
      return res.status(500).json({ error: 'An error occurred.' });
    }

    if (!doc) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    try {
      doc.password = await Account.generateHash(newPass);
      await doc.save();
      req.session.account = Account.toAPI(doc);
      return res.status(200).json({ message: 'Password changed successfully.' });
    } catch {
      return res.status(500).json({ error: 'An error occurred.' });
    }
  });
};

const accountStatus = async (req, res) => {
  try {
    const account = await Account.findById(req.session.account._id).exec();

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    return res.status(200).json(getPremiumStatus(account));
  } catch {
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

const activatePremium = async (req, res) => {
  const plan = `${req.body.plan || ''}`.trim();

  if (!premiumDurations[plan]) {
    return res.status(400).json({ error: 'Invalid premium plan.' });
  }

  try {
    const account = await Account.findById(req.session.account._id).exec();

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    account.premiumTier = plan;
    account.premiumExpiresAt = new Date(Date.now() + premiumDurations[plan]);
    await account.save();

    req.session.account = Account.toAPI(account);

    return res.status(200).json({
      message: 'Premium demo activated.',
      account: getPremiumStatus(account),
    });
  } catch {
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

const cancelPremium = async (req, res) => {
  try {
    const account = await Account.findById(req.session.account._id).exec();

    if (!account) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    account.premiumTier = 'free';
    account.premiumExpiresAt = null;
    await account.save();

    req.session.account = Account.toAPI(account);

    return res.status(200).json({
      message: 'Premium demo canceled.',
      account: getPremiumStatus(account),
    });
  } catch {
    return res.status(500).json({ error: 'An error occurred.' });
  }
};

module.exports = {
  loginPage,
  logout,
  login,
  signup,
  changePassword,
  accountStatus,
  activatePremium,
  cancelPremium,
};
