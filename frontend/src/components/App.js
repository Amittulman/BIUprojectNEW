import Todo from "./Todo";
import Schedule from "./Schedule";
import {Route, Switch} from "react-router";
import React, { Component } from 'react';
import '../components/App.css';


export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: [],
            tasksID: []
        }
        this.setTasks = this.setTasks.bind(this);
        this.getTasks = this.getTasks.bind(this);
        this.getTasksID = this.getTasksID.bind(this);
    }
    setTasks(received_tasks) {
        console.log('before1: ', this.state.tasks)
        console.log('received tasks: ', received_tasks)
        this.setState({
            tasks: received_tasks

        },() => console.log('after:1: ', this.state.tasks));

    }

    getTasks() {
        if (this.state.tasks.length === 0) {
            console.log('empty')
            this.fetchTasks()
        }
        console.log('im after gettask: ', this.state.tasks)
        return this.state.tasks
    }

    getTasksID() {
        if (this.state.tasksID.length === 0) {
            console.log('emptyID')
            this.fetchTasksID()
        }
        return this.state.tasksID
    }

    fetchTasks() {
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
                })
            .catch((error) => {
                console.log(error)
            });
    }

    fetchTasksID() {
        fetch("http://localhost:5000/tasks/trig/1")
            .then(res => res.json())
            .then(
                (result) => {
                    if (result['statusCode'] === 500) throw new Error('Internal server error.');
                    let all_tasks = result.length
                    let tasks1 = []
                    for (let i=0; i<all_tasks; i++){
                        // this.addTask(this.state.task_number, false, true, result[i])
                        tasks1.push(result[i])
                    }
                    this.setState({
                        isLoaded: true,
                        items: JSON.stringify(result),
                        tasksID: tasks1
                    });
                })
            .catch((error) => {
                console.log(error)
            });
    }

    render() {
        return (
            <div className="App">
                <Switch>
                    <Route exact path='/' render={() => <Todo getTasks={this.getTasks} setTasks={this.setTasks}/>}/>
                    {/*<Route handler={this.handler}  exact path='/' component={Todo}/>*/}
                    <Route path='/schedule' render={() => <Schedule getTasksID={this.getTasksID} getTasks={this.getTasks} setTasks={this.setTasks}/>}/>
                </Switch>
            </div>
        )
    }
}