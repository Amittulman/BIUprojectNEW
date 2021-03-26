import './App.css';
import React, {Component} from 'react';

class App extends Component {
  // // Connecting to server
  // let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  // let request = new XMLHttpRequest();
  // request.open('GET', 'http://localhost:5000/gethello');
  // request.responseType = 'text'
  // request.onload = function() {
  //   console.log("Successfully retrieved data from server! The data is: ", request.responseText)
  // }
  // request.send()
  // // End of connection.
  constructor(props) {
    super(props);
    this.state = {
      title: "empty title",
      duration: 0,
      priority: 0,
      category_id: 0,
      constraints: ""
    };
  }

  onSubmitHandler = (event) => {
    event.preventDefault();
    fetch('http://localhost:5000/posttask', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: this.state.title,
        duration: this.state.duration,
        priority: this.state.priority,
        categoryID: this.state.category_id,
        constraints: this.state.constraints,
      })
    }).then(r => r.json())
        .then((json) => {
          console.error("title is: " + this.state.title);
          return "test check123";
        })
        .catch((error) => {
          console.error("Error123.");
        });
  };

  handleChange = (event) => {
    const nam = event.target.name;
    const val = event.target.value;
    this.setState({[nam]: val})
  }


  render() {
    return (
        <div className="App">
          <header className="App-header">
            <form onSubmit={this.onSubmitHandler}>
              <h1>Enter your task</h1>
              <div onChange={this.handleChange}>
                Title:&nbsp;&nbsp;
                <input name='title' type='text'/>
              </div>
              <div onChange={this.handleChange}>
                Duration:&nbsp;&nbsp;
                <input name='duration' type='text'/>
              </div>
              <div onChange={this.handleChange}>
                Priority:&nbsp;&nbsp;
                <input name='priority' type='text'/>
              </div>
              <div onChange={this.handleChange}>
                Category ID:&nbsp;&nbsp;
                <input name='category_id' type='text'/>
              </div>
              <div onChange={this.handleChange}>
                Constraints:&nbsp;&nbsp;
                <input name='constraints' type='text'/>
              </div>
              <input type='submit'/>
            </form> <br/>
          </header>
        </div>
    );
  }

}

export default App;
