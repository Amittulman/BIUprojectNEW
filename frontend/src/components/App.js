import Todo from "./Todo";
import Schedule from "./Schedule";
import {Route, Switch} from "react-router";
import React, {useState} from 'react';
import '../components/App.css';


const App = () => {
    const [tasks, setTasks] = useState([])
    const [tasksID, setTaskID] = useState([])

    //TODO - check if possible to pass setTask to child component instead.
    const taskSetter = (received_tasks) => {
        setTasks(received_tasks)
    }

    const taskGetter = () => {
        if (tasks.length === 0) {
            fetchTasks()
        }
        return tasks
    }

    const taskIDGetter = () => {
        if (tasksID.length === 0) {
            fetchTasksID()
        }
        return tasksID
    }

    const fetchTasks = () => {
        fetch("http://localhost:5000/tasks/gettodolist/1")
            .then(res => res.json())
            .then(
                (result) => {
                    if (result['statusCode'] === 500) throw new Error('Internal server error.');
                    let all_tasks = result['tasks'].length
                    let tasks1 = []
                    for (let i=0; i<all_tasks; i++){
                        tasks1.push(result['tasks'][i])
                    }
                    setTasks(tasks1)
                })
            .catch((error) => {
                console.log(error)
            });
    }

    const fetchTasksID = () => {
        fetch("http://localhost:5000/tasks/trig/1")
            .then(res => res.json())
            .then(
                (result) => {
                    if (result['statusCode'] === 500) throw new Error('Internal server error.');
                    let all_tasks = result.length
                    let tasks1 = []
                    for (let i=0; i<all_tasks; i++){
                        tasks1.push(result[i])
                    }
                    setTaskID(tasks1)
                })
            .catch((error) => {
                console.log(error)
            });
    }

    return (
        <div className="App">
            <Switch>
                <Route exact path='/' render={() => <Todo updating_tasks={tasks} getTasks={taskGetter} setTasks={taskSetter}/>}/>
                <Route path='/schedule' render={() => <Schedule getTasksID={taskIDGetter} updating_tasks={tasks} getTasks={taskGetter} setTasks={taskSetter}/>}/>
            </Switch>
        </div>
    )
}

export default App