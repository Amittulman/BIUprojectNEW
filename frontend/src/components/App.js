import Todo from "./Todo";
import Schedule from "./Schedule";
import {Route, Switch} from "react-router";
import React, { useState, Component } from 'react';
import '../components/App.css';


export default class App extends Component {
    constructor(props) {
        super(props);
        this.tasks = []
        this.setTasks = this.setTasks.bind(this);
        this.getTasks = this.getTasks.bind(this);
    }
    setTasks(received_tasks) {
        this.tasks = received_tasks
    }
    getTasks() {
        return this.tasks
    }
    render() {
        return (
            <div className="App">
                <Switch>
                    <Route exact path='/' render={() => <Todo getTasks={this.getTasks} setTasks={this.setTasks}/>}/>
                    {/*<Route handler={this.handler}  exact path='/' component={Todo}/>*/}
                    <Route path='/schedule' render={() => <Schedule getTasks={this.getTasks} setTasks={this.setTasks}/>}/>
                </Switch>
            </div>
        )
    }
}