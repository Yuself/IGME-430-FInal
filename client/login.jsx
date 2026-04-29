const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom/client');

const { handleError, hideError, sendPost } = helper;

/* Handles login form submission */
const handleLogin = (e) => {
  e.preventDefault();
  hideError();

  const username = globalThis.document.querySelector('#user').value;
  const pass = globalThis.document.querySelector('#pass').value;

  if (!username || !pass) {
    handleError('Username or password is empty!');
    return false;
  }

  sendPost('/login', { username, pass });
  return false;
};

/* Handles signup form submission */
const handleSignup = (e) => {
  e.preventDefault();
  hideError();

  const username = globalThis.document.querySelector('#user').value;
  const pass = globalThis.document.querySelector('#pass').value;
  const pass2 = globalThis.document.querySelector('#pass2').value;

  if (!username || !pass || !pass2) {
    handleError('All fields are required!');
    return false;
  }

  if (pass !== pass2) {
    handleError('Passwords do not match!');
    return false;
  }

  sendPost('/signup', { username, pass, pass2 });
  return false;
};

/* Login form component */
const LoginWindow = (props) => {
  return (
    <form id="loginForm" name="loginForm"
      onSubmit={handleLogin}
      action="/login"
      method="POST"
      className="mainForm"
    >
      <label htmlFor="user">Username: </label>
      <input id="user" type="text" name="username" placeholder="username" autoComplete="username" />

      <label htmlFor="pass">Password: </label>
      <input id="pass" type="password" name="pass" placeholder="password" autoComplete="current-password" />

      <input className="formSubmit" type="submit" value="Sign In" />
    </form>
  );
};

/* Signup form component */
const SignupWindow = (props) => {
  return (
    <form id="signupForm" name="signupForm"
      onSubmit={handleSignup}
      action="/signup"
      method="POST"
      className="mainForm"
    >
      <label htmlFor="user">Username: </label>
      <input id="user" type="text" name="username" placeholder="username" autoComplete="username" />

      <label htmlFor="pass">Password: </label>
      <input id="pass" type="password" name="pass" placeholder="password" autoComplete="new-password" />

      <label htmlFor="pass2">Retype Password: </label>
      <input id="pass2" type="password" name="pass2" placeholder="retype password" autoComplete="new-password" />

      <input className="formSubmit" type="submit" value="Sign Up" />
    </form>
  );
};

/* Renders the login form */
const renderLogin = (root) => {
  root.render(<LoginWindow />);
};

/* Renders the signup form */
const renderSignup = (root) => {
  root.render(<SignupWindow />);
};

/* Sets up the login page React UI */
const init = () => {
  const content = globalThis.document.getElementById('content');
  const root = ReactDOM.createRoot(content);

  const navLinks = globalThis.document.querySelectorAll('.navlink a');
  const loginLink = navLinks[0];
  const signupLink = navLinks[1];

  const setActiveLink = (activeLink) => {
    loginLink.classList.toggle('active', activeLink === loginLink);
    signupLink.classList.toggle('active', activeLink === signupLink);
  };

  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    hideError();
    setActiveLink(loginLink);
    renderLogin(root);
  });

  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    hideError();
    setActiveLink(signupLink);
    renderSignup(root);
  });

  setActiveLink(loginLink);
  renderLogin(root);
};

globalThis.window.onload = init;
