import './App.css';

function App() {
  // Connecting to server
  let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  let request = new XMLHttpRequest();
  request.open('GET', 'http://localhost:5000/gethello');
  request.responseType = 'text'
  request.onload = function() {
    console.log("Successfully retrieved data from server! The data is: ", request.responseText)
  }
  request.send()
  // End of connection.


  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
