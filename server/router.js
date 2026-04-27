const controllers = require('./controllers');
//domo c
const mid = require('./middleware');

//changed for domo c
const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
  app.get('/accountStatus', mid.requiresLogin, controllers.Account.accountStatus);
  app.post('/activatePremium', mid.requiresLogin, controllers.Account.activatePremium);
  app.post('/cancelPremium', mid.requiresLogin, controllers.Account.cancelPremium);
  app.post('/deleteDomo', mid.requiresLogin, controllers.Domo.deleteDomo);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/maker', mid.requiresLogin, controllers.Domo.makerPage);
  // domo D
  app.get('/getDomos', mid.requiresLogin, controllers.Domo.getDomos);
  app.post('/maker', mid.requiresLogin, controllers.Domo.makeDomo);

  //final
  app.post('/chat', mid.requiresLogin, controllers.Chat.chat);

  app.post('/saveConversation', mid.requiresLogin, controllers.Conversation.saveConversation);
  app.get('/history', mid.requiresLogin, controllers.History.historyPage);
  app.get('/getConversations', mid.requiresLogin, controllers.History.getConversations);
  app.get('/getConversationById', mid.requiresLogin, controllers.History.getConversationById);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  app.use((req, res) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.accepts('html') !== 'html') {
      return res.status(404).json({ error: 'Route not found.' });
    }

    return res.status(404).render('notFound');
  });
};

module.exports = router;
