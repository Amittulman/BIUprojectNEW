import './NewTasks.css';
import React, {Component} from 'react';
import GetTasks from "./GetTasks";
class NewTasks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user_id: 0,
      title: "empty title",
      duration: 0,
      priority: 0,
      category_id: 0,
      constraints: ""
    };
  }

  onSubmitHandler = (event) => {
    event.preventDefault();
    fetch('http://localhost:5000/taskfortodolist', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: parseInt(this.state.user_id),
        title: this.state.title,
        duration: parseInt(this.state.duration),
        priority: parseInt(this.state.priority),
        categoryID: parseInt(this.state.category_id),
        constraints: this.state.constraints,
      })
    })
        .then((response) => {
          if (response.status === 201) {
            console.log('GetTasks hes been sent successfully.');
          } else {
            console.log('GetTasks hes been sent. HTTP request status code: ' + response.status);
          }
        })
        .catch((error) => {
          console.error("Error while submitting task: " + error.message);
        });
  };

  handleChange = (event) => {
    const nam = event.target.name;
    const val = event.target.value;
    this.setState({[nam]: val})
  }


  render() {
    let title = <div onChange={this.handleChange}> Title:&nbsp;&nbsp; <input name='title' type='text'/></div>;
    let duration = <div onChange={this.handleChange}> Duration:&nbsp;&nbsp;<input name='duration' type='text'/></div>;
    let priority = <div onChange={this.handleChange}>Priority:&nbsp;&nbsp;<input name='priority' type='text'/></div>;
    let category_id = <div onChange={this.handleChange}>Category:&nbsp;&nbsp;<input name='category_id' type='text'/></div>;
    let constraints = <div onChange={this.handleChange}>Constraints:&nbsp;&nbsp;<input name='constraints' type='text'/></div>;
    return (
        <div className="App">
          <header className="App-header">
            <form onSubmit={this.onSubmitHandler}>
              <h1>Enter your tasks</h1>
              {title}{duration}{priority}{category_id}{constraints}
              <input className="btn btn-primary btn-md" type='submit'/>
            </form><br/>
            <GetTasks/>
          </header>
        </div>
    );
  }

}

export default NewTasks;
