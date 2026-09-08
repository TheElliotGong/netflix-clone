// Helper function to hide warning message.
// `scope` limits the lookup to one form/dialog when a page has several.
const hideError = (scope = document) => {
  const root = scope || document;
  const warning = root.querySelector('.warning');

  if (warning) {
    warning.classList.add('hidden');
  }
};
// Helper function to show warning message.
const handleError = (message, scope = document) => {
  const root = scope || document;
  const warning = root.querySelector('.warning');

  if (!warning) {
    return;
  }

  warning.classList.remove('hidden');

  const errorMessage = warning.querySelector('.errorMessage') || root.querySelector('.errorMessage');

  if (errorMessage) {
    errorMessage.textContent = message;
  }
};
/**
 * This function helps send post requests to the server.
 * @param {*} url the specific url to send the post request to.
 * @param {*} data the data being sent to the server.
 * @param {*} handler the function to handle the response from the server.
 * @param {*} scope optional element to scope the warning message lookup to.
 */
const sendPost = async (url, data, handler, scope = document) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  let result = {};

  if (response.status !== 204) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      result = await response.json();
    }
  }

  // Hide the error message if it is showing
  hideError(scope);

  // Redirect to the page if the server requests it.
  if (result.redirect) {
    window.location = result.redirect;
  }
  // Show an error message if the server sends one.
  if (result.error) {
    handleError(result.error, scope);
    return;
  }
  // Call the handler function if the server sends one.
  if (handler) {
    handler(result);
  }
};
/**
 * This function handles the load profile process for the Netflix Clone app.
 * @param {*} name the name of the profile to load.
 * @returns
 */
const handleLoadProfile = (name) => {
  if (!name) {
    handleError('Name is required!');
    return false;
  }
  sendPost('/loadProfile', { name });
  return false;
};

module.exports = {
  sendPost,
  handleLoadProfile,
  hideError,
  handleError,
};
