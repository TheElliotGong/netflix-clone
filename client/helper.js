
  const hideError = () => {document.querySelector(".warning").classList.add('hidden');};
  const handleError = (message) => {
    document.querySelector(".warning").classList.remove('hidden');
    document.querySelector(".errorMessage").textContent = message;};
  const sendPost = async (url, data, handler) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    const result = await response.json();
    document.querySelector('.warning').classList.add('hidden');
  
    if(result.redirect) {
      window.location = result.redirect;
    }
  
    if(result.error) {
      handleError(result.error);
    }
    if(handler)
    {
        handler(result);
    }
  };

  const handleLoadProfile = (name) => {
    
    if (!name) {
        // helper.handleError('Name is required!');
        return false;
    }
    sendPost('/loadProfile', { name });
    return false;
}

  module.exports = { sendPost, handleLoadProfile, hideError, handleError};