/* Takes in an error message. Sets the error message up in html, and
   displays it to the user. Will be hidden by other events that could
   end in an error.
*/
const handleError = (message) => {
  globalThis.document.getElementById('errorMessage').textContent = message;
  globalThis.document.getElementById('domoMessage').classList.remove('hidden');
};

/* Hides the error message box.
*/
const hideError = () => {
  globalThis.document.getElementById('domoMessage').classList.add('hidden');
};

/* Sends post requests to the server using fetch. Will look for various
   entries in the response JSON object, and will handle them appropriately.
*/
const sendPost = async (url, data, handler) => {
  const response = await globalThis.fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  hideError();

  if (handler) {
    handler(result);
  }

  if (result.redirect) {
    globalThis.location = result.redirect;
  }

  if (result.error) {
    handleError(result.error);
  }
};

module.exports = {
  handleError,
  hideError,
  sendPost,
};