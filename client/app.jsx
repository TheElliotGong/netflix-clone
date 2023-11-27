const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');
/**
 * This function handles the creation of a domo.
 * @param {*} e 
 * @returns 
 */
// const handleDomo = (e) => {
//     e.preventDefault();
//     helper.hideError();

//     const name = e.target.querySelector('#domoName').value;
//     const age = e.target.querySelector('#domoAge').value;
//     const level = e.target.querySelector('#domoLevel').value;
//     //Check if form input is empty.
//     if (!name || !age || !level) {
//         helper.handleError('All fields are required!');
//     }
//     //Send post request with data.
//     helper.sendPost(e.target.action, { name, age, level }, loadDomosFromServer);
//     return false;
// };
// /**
//  * Creates a domo maker form with a name and age input.
//  * @param {*} props 
//  * @returns the html elements for the form.
//  */
// const DomoForm = (props) => {
//     return (
//         <form id="domoForm" onSubmit={handleDomo} action="/maker" method="POST" className="domoForm">
//             <label htmlFor="name">Name: </label>
//             <input id="domoName" type="text" name="name" placeholder="Domo Name" />
//             <label htmlFor="age">Age: </label>
//             <input id="domoAge" type="number" name="age" min="0" />
//             <label htmlFor="level">Level: </label>
//             <input id="domoLevel" type="number" name="level" min="1" />
//             <input className="makeDomoSubmit" type="submit" value="Make Domo" />
//         </form>
//     );
// };
// /**
//  * Returns the list of created domos if possible.
//  * @param {*} props 
//  * @returns the html elements for the form
//  */
// const DomoList = (props) => {
//     //Check if domos exist.
//     if (props.domos.length === 0) {
//         return (
//             <div className="domoList">
//                 <h3 className="emptyDomo">No Domos yet</h3>
//             </div>
//         );
//     }
//     //Otherwise, create html elements from each domo object.
//     const domoNodes = props.domos.map(domo => {
//         return <div key={domo._id} className='domo'>
//             < img src='/assets/img/domoface.jpeg' alt='domo face' className='domoFace' />
//             <h3 className='domoName'>Name: {domo.name}</h3>

//             <h3 className='domoAge'>Age: {domo.age}</h3>
//             <h3 className='domoLevel'>Level: {domo.level}</h3>
//         </div>
//     });
//     //Return the domo list.
//     return (
//         <div className="domoList">
//             {domoNodes}
//         </div>
//     );
// };
// /**
//  * Loads the domos from the server.
//  */
// const loadDomosFromServer = async () => {
//     const response = await fetch('/getDomos');
//     const data = await response.json();
//     //Render the domos under the selected html element.
//     ReactDOM.render(
//         <DomoList domos={data.domos} />, document.querySelector("#domos")
//     );
// };
const ProfileList = (props) => {
    const profileNodes = props.profiles.map(profile => {
        return <div key={profile._id} className='profile'>
            <button >< img src='/assets/img/netflix-avatar.png' alt='avatar' className='avatar' /></button>
            <h3 className='name' >{profile.name}</h3>
        </div>
    });
    return (<div className="profileList">
        {profileNodes}
    </div>);
};

const loadProfiles = async () => {
    const response = await fetch('/getProfiles');
    const data = await response.json();
    ReactDOM.render(
        <ProfileList profiles={data.profiles} />, document.querySelector("#profiles")
    );

};
/**
 * Initializes the page.
 */
const init = () => {
    
    loadProfiles();



};

window.onload = init;