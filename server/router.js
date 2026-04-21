const controllers = require('./controllers');
//domo c
const mid = require('./middleware');

//changed for domo c
const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/deleteDomo', mid.requiresLogin, controllers.Domo.deleteDomo);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/maker', mid.requiresLogin, controllers.Domo.makerPage);
  // domo D
  app.get('/getDomos', mid.requiresLogin, controllers.Domo.getDomos);
  app.post('/maker', mid.requiresLogin, controllers.Domo.makeDomo);

    //final
  app.post('/chat', mid.requiresLogin, controllers.Chat.chat);
  
  app.post('/saveConversation', mid.requiresLogin, controllers.Conversation.saveConversation);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

};

module.exports = router;