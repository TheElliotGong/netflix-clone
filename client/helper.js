//Helper function to hide warning message
const hideError = () => { document.querySelector(".warning").classList.add('hidden'); };
//Helper function to show warning message.
const handleError = (message) => {
  document.querySelector(".warning").classList.remove('hidden');
  document.querySelector(".errorMessage").textContent = message;
};
/**
 * This function helps send post requests to the server.
 * @param {*} url the specific url to send the post request to.
 * @param {*} data the data being sent to the server.
 * @param {*} handler the function to handle the response from the server.
 */
const sendPost = async (url, data, handler) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  //Hide the error message if it is showing
  if (document.querySelector('.warning')) {
   hideError();
  }

  //Redirect to the page if the server requests it.
  if (result.redirect) {
    window.location = result.redirect;
  }
  //Show an error message if the server sends one.
  if (result.error) {
    handleError(result.error);
  }
  //Call the handler function if the server sends one.
  if (handler) {
    handler(result);
  }
};
/**
 * This function handles the load profile process for the Domomaker app.
 * @param {*} name the name of the profile to load.
 * @returns 
 */
const handleLoadProfile = (name) => {

  if (!name) {
    helper.handleError('Name is required!');
    return false;
  }
  sendPost('/loadProfile', { name });
  return false;
}

module.exports = { sendPost, handleLoadProfile, hideError, handleError };