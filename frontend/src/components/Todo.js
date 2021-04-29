import './Todo.css';
import React, {Component} from 'react';
import Menu from "./Menu";

class Todo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks_jsx:[],
      tasks:[],
      task_number: 1,
      error: null,
      isLoaded: false
    };
  }


  onSubmitHandler = (event) => {
    this.setState((state) => ({tasks: state.tasks.filter((element) => element !== null) }))
    event.preventDefault();
    fetch('http://localhost:5000/taskfortodolist', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.tasks.filter((element) => element !== null))
    })
        .then((response) => {
          if (response.status === 201) {
            console.log("User's tasks hes been sent successfully.");
          } else {
            console.log("User's tasks hes been sent. HTTP request status code: " + response.status);
          }
        })
        .catch((error) => {
          console.error("Error while submitting task: " + error.message);
        });
  };

  handleChange = (event, index) => {
    console.log('handle change has been called.')
    const nam = event.target.name;
    const val = event.target.value;
    let tasks = [...this.state.tasks]
    tasks[index-1] = {...tasks[index-1], [nam]: val}
    this.setState({tasks});
  }

  addTask = (index, open, new_task, values) => {if (values == null) {
      values = {'task_id':'','task_title':'empty task', 'duration':'','priority':'','category_id':'','constraints':''}
    }
    let i = index
    let sign;
    if (open) {
      sign = <svg id='expand_icon' onClick={() =>  this.addTask(index, !open, false)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgb(12, 13, 13)" width="30px" height="30px"><path d="M0 0h24v24H0z" fill="none"/>
        <path d="M7 11v2h10v-2H7zm5-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>;
    } else {
      sign = <svg id='expand_icon' name='plus' onClick={() =>  this.addTask(index, !open, false)} key='plus_sign' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgb(12, 13, 13)" width="30px" height="30px">
        <path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      </svg>;
    }

    let trash_bin = <svg id='bin_icon' onClick={() => this.remove_task(index)} height="30px" viewBox="-40 0 427 427.00131" width="30px" xmlns="http://www.w3.org/2000/svg"><path d="m232.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"/><path d="m114.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"/><path d="m28.398438 127.121094v246.378906c0 14.5625 5.339843 28.238281 14.667968 38.050781 9.285156 9.839844 22.207032 15.425781 35.730469 15.449219h189.203125c13.527344-.023438 26.449219-5.609375 35.730469-15.449219 9.328125-9.8125 14.667969-23.488281 14.667969-38.050781v-246.378906c18.542968-4.921875 30.558593-22.835938 28.078124-41.863282-2.484374-19.023437-18.691406-33.253906-37.878906-33.257812h-51.199218v-12.5c.058593-10.511719-4.097657-20.605469-11.539063-28.03125-7.441406-7.421875-17.550781-11.5546875-28.0625-11.46875h-88.796875c-10.511719-.0859375-20.621094 4.046875-28.0625 11.46875-7.441406 7.425781-11.597656 17.519531-11.539062 28.03125v12.5h-51.199219c-19.1875.003906-35.394531 14.234375-37.878907 33.257812-2.480468 19.027344 9.535157 36.941407 28.078126 41.863282zm239.601562 279.878906h-189.203125c-17.097656 0-30.398437-14.6875-30.398437-33.5v-245.5h250v245.5c0 18.8125-13.300782 33.5-30.398438 33.5zm-158.601562-367.5c-.066407-5.207031 1.980468-10.21875 5.675781-13.894531 3.691406-3.675781 8.714843-5.695313 13.925781-5.605469h88.796875c5.210937-.089844 10.234375 1.929688 13.925781 5.605469 3.695313 3.671875 5.742188 8.6875 5.675782 13.894531v12.5h-128zm-71.199219 32.5h270.398437c9.941406 0 18 8.058594 18 18s-8.058594 18-18 18h-270.398437c-9.941407 0-18-8.058594-18-18s8.058593-18 18-18zm0 0"/><path d="m173.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"/></svg>
    let title = <span key='title' id='task_elm' onChange={(e) => this.handleChange(e, i)}> <input id='title_textbox' name='title' type='text' defaultValue={values['task_title']}/></span>
    let duration = <div style={{display:open ? 'block': 'none'}} key='duration' id='task_elm' onChange={(e) => this.handleChange(e, i)}> Duration:&nbsp;&nbsp;<input id={'nums_input'+i} name='duration' type='text' defaultValue={values['duration']}/></div>;
    let priority = <div style={{display:open ? 'block': 'none'}} key='priority' id='task_elm' onChange={(e) => this.handleChange(e, i)}>Priority:&nbsp;&nbsp;
      <select id='priority_options' name='priority' defaultValue={values['priority']} onChange={this.handleChange}>
        <option value="0">None</option>
        <option value="1">Low</option>
        <option value="2">Medium</option>
        <option value="3">High</option>
      </select></div>;
    let category_id = <div style={{display:open ? 'block': 'none'}} key='category_id' id='task_elm' onChange={(e) => this.handleChange(e, i)}>Category:&nbsp;&nbsp;<input name='category_id' type='text' defaultValue={values['category_id']}/></div>;
    let constraints = <div style={{display:open ? 'block': 'none'}} key='constraints' id='task_elm' onChange={(e) => this.handleChange(e, i)}>Constraints:&nbsp;&nbsp;<input name='constraints' type='text' defaultValue={values['constraints']}/></div>;
    let task1 = <div id='task' style={{maxHeight:open ? '250px': '10000px', minHeight:open ? '0': '0px'}}>{[title, duration, priority, category_id, constraints]}</div>
    let task = <div key={index} id='task_container' >{[sign, task1,trash_bin]}</div>
    if (new_task) {
      return this.setState((state) => ({
        tasks_jsx: state.tasks_jsx.concat([task]),
        // tasks: state.tasks.concat([values]),
        task_number: state.task_number + 1,
      }));
    } else {
      this.setState ((state) => ({
        tasks_jsx: [
          ...state.tasks_jsx.slice(0,i-1),
          task,
          ...state.tasks_jsx.slice(i)
        ],
      }));
    }
  }

  remove_task = (i) => {
    this.setState({
      tasks_jsx: [
        ...this.state.tasks_jsx.slice(0,i-1),
        [],
        ...this.state.tasks_jsx.slice(i)
      ],
      tasks: [
        ...this.state.tasks.slice(0,i-1),
        null,
        ...this.state.tasks.slice(i)
      ],
    });
  }

  getTasks = (event) => {
    fetch("http://localhost:5000/tasks/gettodolist/1")
        .then(res => res.json())
        .then(
            (result) => {
              if (result['statusCode'] === 500) throw new Error('Internal server error.');
              let all_tasks = result['tasks'].length
              let tasks1 = []
              for (let i=0; i<all_tasks; i++){
                // this.addTask(this.state.task_number, false, true, result[i])
                tasks1.push(result['tasks'][i])
                // console.log('a ', result['tasks'][i])
              }
              this.setState({
                isLoaded: true,
                items: JSON.stringify(result),
                tasks: tasks1
              });
              // return tasks1
            })
        .catch((error) => {
          console.log(error)
        });
  }

  componentDidMount() {
    // this.props.setTasks(['test','data']);
    this.getTasks()
    //TODO - get tasks from server (get getTasks to work)
    // let tasks = this.getTasks()
    // let tasks = [{'task_id':'1','task_title':'first task', 'duration':'','priority':'','category_id':'','constraints':''}];
    //Save tasks received from DB in parent, for schedule component to use.
    // this.props.setTasks(this.state.tasks)
    let that = this;
    setTimeout(function() {
      for (let i=0; i<3; i++){
        that.addTask(that.state.task_number, false, true, that.state.tasks[i])
      }
      that.addTask(that.state.task_number, false, true)

    },300)
  }

  render() {
    let task_list = this.state.tasks_jsx.map((x,index) => (x));
    return (
        <div>
          <Menu/>
          <header className="App-header">
            <form id='test' onSubmit={this.onSubmitHandler}>
              <h1>Enter your tasks</h1>
              <br/>
              <div>
                {task_list}
              </div>
              <div>
                <div onClick={() => this.addTask(this.state.task_number, false, true)}>Add new task</div>
              </div>
              <input className="btn btn-primary btn-md" type='submit'/>
            </form><br/>
          </header>
        </div>
    );
  }

}

export default Todo;
