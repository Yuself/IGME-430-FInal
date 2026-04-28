const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
  app.get('/accountStatus', mid.requiresLogin, controllers.Account.accountStatus);
  app.post('/activatePremium', mid.requiresLogin, controllers.Account.activatePremium);
  app.post('/cancelPremium', mid.requiresLogin, controllers.Account.cancelPremium);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/app', mid.requiresLogin, (req, res) => res.render('app'));

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
