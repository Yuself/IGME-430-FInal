const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom/client');

const { handleError, hideError, sendPost } = helper;
const { useState, useEffect } = React;

/* Handles domo form submission */
const handleDomo = (e, onDomoAdded) => {
    e.preventDefault();
    hideError();

    const name = globalThis.document.querySelector('#domoName').value;
    const age = globalThis.document.querySelector('#domoAge').value;
    const level = globalThis.document.querySelector('#domoLevel').value;

    if (!name || !age || !level) {
        handleError('All fields are required!');
        return false;
    }

    sendPost('/maker', { name, age, level }, onDomoAdded);
    return false;
};
/* Handles deleting a domo */
const handleDeleteDomo = (domoId, onDomoDeleted) => {
    hideError();
    sendPost('/deleteDomo', { id: domoId }, onDomoDeleted);
    return false;
};
/* Form component for creating domos */
const DomoForm = (props) => {
    return (
        <form
            id="domoForm"
            name="domoForm"
            onSubmit={(e) => handleDomo(e, props.triggerReload)}
            action="/maker"
            method="POST"
            className="domoForm"
        >
            <label htmlFor="name">Name: </label>
            <input id="domoName" type="text" name="name" placeholder="Domo Name" />

            <label htmlFor="age">Age: </label>
            <input id="domoAge" type="text" name="age" placeholder="Domo Age" />

            <label htmlFor="level">Level: </label>
            <input id="domoLevel" type="number" name="level" min="1" placeholder="Domo Level" />

            <input className="makeDomoSubmit" type="submit" value="Make Domo" />
        </form>
    );
};

/* Displays the list of domos */
const DomoList = (props) => {
    const [domos, setDomos] = useState([]);

    useEffect(() => {
        const loadDomosFromServer = async () => {
            const response = await globalThis.fetch('/getDomos');
            const data = await response.json();
            setDomos(data.domos);
        };

        loadDomosFromServer();
    }, [props.reloadDomos]);

    if (domos.length === 0) {
        return (
            <div className="domoList">
                <h3 className="emptyDomo">No Domos yet</h3>
            </div>
        );
    }

    const domoNodes = domos.map((domo) => {
        return (
            <div key={domo._id} className="domo">
                <img className="domoFace" src="/assets/img/face.png" alt="domo face" />
                <h3 className="domoName">Name: {domo.name}</h3>
                <h3 className="domoAge">Age: {domo.age}</h3>
                <h3 className="domoLevel">Level: {domo.level}</h3>
                <button
                    className="deleteDomoButton"
                    onClick={() => handleDeleteDomo(domo._id, props.triggerReload)}
                >
                    Delete
                </button>
            </div>
        );
    });

    return (
        <div className="domoList">
            {domoNodes}
        </div>
    );
};

/* Main app component */
const App = () => {
  const [reloadDomos, setReloadDomos] = useState(false);

  const triggerReload = () => {
    setReloadDomos(!reloadDomos);
  };

  return (
    <div>
      <DomoForm triggerReload={triggerReload} />
      <DomoList reloadDomos={reloadDomos} triggerReload={triggerReload} />
    </div>
  );
};

/* Sets up the maker page React UI */
const init = () => {
    const content = globalThis.document.getElementById('content');
    const root = ReactDOM.createRoot(content);
    root.render(<App />);
};

globalThis.window.onload = init;