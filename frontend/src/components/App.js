import Todo from "./Todo";
import Schedule from "./Schedule";
import {Route, Switch} from "react-router";
import React, {useState, useEffect} from 'react';
import '../components/App.css';
import Menu from "./Menu";


const App = () => {
    const [tasks, setTasks] = useState([])
    const [tasksID, setTaskID] = useState([])
    const [toOptimize, setToOptimize] = useState(false)

    useEffect(() => {
        // if(toOptimize)
            // window.location.reload();
    }, [toOptimize])

    //TODO - check if possible to pass setTask to child component instead.
    const taskSetter = (received_tasks) => {
        setTasks(received_tasks)
    }

    const taskGetter = () => {
        fetchTasks()
    }

    const taskIDTrig = () => {
        fetchTasksIDTrig()
        return tasksID
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
                    let tasks2 = {}
                    console.log('result: ',result)
                    for (let i=0; i<all_tasks; i++){
                        tasks1.push(result['tasks'][i])
                        tasks2[result['tasks'][i]['task_id']] = result['tasks'][i]
                    }
                    console.log('tasks: ', tasks2)
                    setTasks(tasks2)
                })
            .catch((error) => {
                console.log(error)
            });
    }

    const fetchTasksIDTrig = () => {
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
                    console.log('inside trig: ', tasks1)
                    console.log('previous value: ', tasksID)
                    console.log('and res: ', result)
                    setTaskID(tasks1)
                })
            .catch((error) => {
                console.log(error)
            });
    }

    const fetchTasksID = () => {
        fetch("http://localhost:5000/tasks/GetSchedule/1")
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

    const findTask = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            alert('You typed "' + event.target.value + '" in the search box.')
        }
    }

    //TODO - use this to minimize todo component.
    const closeTaskPane = () => {
        let todo_element = document.getElementById('todo_parent')
        let schedule_element = document.getElementById('schedule_parent')
        if (todo_element.className === 'col-4') {
            todo_element.classList.remove('col-4')
            todo_element.classList.add('gone')
            schedule_element.classList.remove('col-8')
            // schedule_element.classList.add('col')
        } else {
            todo_element.classList.remove('gone')
            todo_element.classList.add('col-4')
            // schedule_element.classList.remove('col')
            // schedule_element.classList.add('col-4')
        }
    }

    let search_input = <input onKeyPress={findTask} id='input' type='text' placeholder='Search Task...'/>;
    let search = <div>{search_input}</div>

    const foo = (event) => {
        let checkBox = event.target
        let thisWeek = document.getElementById('this_week')
        let nextWeek = document.getElementById('next_week')
        if (checkBox.checked) {
            nextWeek.classList.remove('next_week')
            nextWeek.classList.add('next_week_chosen')
            thisWeek.classList.remove('this_week_chosen')
            thisWeek.classList.add('this_week')
        } else {
            thisWeek.classList.remove('this_week')
            thisWeek.classList.add('this_week_chosen')
            nextWeek.classList.remove('next_week_chosen')
            nextWeek.classList.add('next_week')
        }
    }

    return (
        <div className="App">
            {/*<button onClick={closeTaskPane}>click</button>*/}
            <div id='site_top' className='row'>
                <div className='col-4'>{search}</div>
                <button className='col-2' style={{marginTop: '25px'}}>Choose category</button>
            </div>
            <div className='row'>
                <div id='todo_parent' className='col-4'>
                    <div id='todo_component' className='sticky-top'>
                        <Todo setToOptimize={setToOptimize} updating_tasks={tasks} trigTasks={taskIDTrig} getTasks={taskGetter} setTasks={taskSetter}/>
                    </div>
                    <div id='boo' className='row'>
                        <span id='this_week' className='this_week'>This week&nbsp;&nbsp;</span>
                        <label className="switch">
                            <input onChange={(e)=>foo(e)} id='aba' type="checkbox"/>
                            <span className="slider round"/>
                        </label>
                        <span id='next_week' className='next_week'>&nbsp;&nbsp;Next week</span>
                    </div>
                </div>

                <div id='schedule_parent' className='col-8'>
                    <div id='schedule_component'>
                        <Schedule setToOptimize={setToOptimize} toOptimize={toOptimize} tasksID={tasksID} getTasksID={taskIDGetter} trigTasksID={taskIDTrig} updating_tasks={tasks} getTasks={taskGetter} setTasks={taskSetter}/>
                    </div>
                </div>
            </div>
            {/*<Switch>*/}
            {/*    <Route exact path='/' render={() => <Todo updating_tasks={tasks} getTasks={taskGetter} setTasks={taskSetter}/>}/>*/}
            {/*    <Route path='/schedule' render={() => <Schedule getTasksID={taskIDGetter} updating_tasks={tasks} getTasks={taskGetter} setTasks={taskSetter}/>}/>*/}
            {/*</Switch>*/}
        </div>
    )
}

export default App