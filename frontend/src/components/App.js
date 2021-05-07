import Todo from "./Todo";
import Schedule from "./Schedule";
import {Route, Switch} from "react-router";
import React, {useState, useEffect} from 'react';
import '../components/App.css';
import Menu from "./Menu";


const time_of_day = [new Set(), new Set(), new Set()]
const slots_per_day = 24*2

const App = () => {
    const [tasks, setTasks] = useState([])
    const [tasksID, setTaskID] = useState([])
    const [toOptimize, setToOptimize] = useState(false)
    const [categoryTable, setCategoryTable] = useState([])
    const [table1, setTable] = useState([])

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
                    for (let i=0; i<all_tasks; i++){
                        tasks1.push(result['tasks'][i])
                        tasks2[result['tasks'][i]['task_id']] = result['tasks'][i]
                    }
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
    let day = ['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const switch_weeks = (event) => {
        let checkBox = event.target
        let thisWeek = document.getElementById('this_week')
        let nextWeek = document.getElementById('next_week')
        if (checkBox.checked) {
            nextWeek.classList.remove('week')
            nextWeek.classList.add('next_week_chosen')
            thisWeek.classList.remove('this_week_chosen')
            thisWeek.classList.add('week')
        } else {
            thisWeek.classList.remove('week')
            thisWeek.classList.add('this_week_chosen')
            nextWeek.classList.remove('next_week_chosen')
            nextWeek.classList.add('week')
        }
    }

    const initialSchedule = () => {
        let jsx = []
        let hour;
        let minute = 0;
        let content = []
        for (let j = 0; j < slots_per_day; j++) {
            hour = Math.floor(j / 2);
            minute = 30 * (j % 2);
            if (hour < 10) hour = '0' + hour
            if (minute === 0) minute = '00'
            content.push(<td key={'time' + hour + ':' + minute}>{hour}:{minute}</td>);
        }
        jsx.push(<tr key={'tr' + 0}><th key={'th' + 0}>Time</th>{content}</tr>);
        return jsx
    }

    const markCategories = (event, option) => {
        let jsx = initialSchedule()
        const slots_per_day = 24*2
        let empty_jsx = []
        for (let i = 1; i < 8; i++) {
            let empty_content = []
            for (let j = 0; j < slots_per_day; j++) {
                empty_content.push(<td key={'cell_' + (slots_per_day * (i - 1) + j) + '_empty'}
                                       id={'cell_' + (slots_per_day * (i - 1) + j) + '_empty'}
                                       draggable='true' onDragStart={dragStart} onDragOver={(e) => allowDropCategory(e,option)}
                />);
            }
            jsx.push(<tr key={'tr' + i + '_empty'}>
                <th key={'th' + i + '_empty'}>{day[i]}</th>
                {empty_content}</tr>)
        }
        let empty_table = [<table key='category_table' id='category_table'><tbody>{jsx}</tbody></table>]
        setTable(empty_table)
        let cell = document.getElementById('cell_0_empty')
        console.log(cell)

    }

    const dragStart = (event) => {
        event.dataTransfer.setData('text/plain', event.target.id);
    }

    const allowDropCategory = (event, index) => {
        event.preventDefault();
        switch (index){
            case 0:
                event.target.style.backgroundColor = 'yellow'
                event.target.textContent= 'Type A'
                break;
            case 1:
                event.target.style.backgroundColor = 'orange'
                event.target.textContent= 'Type B'
                break;
            case 2:
                event.target.style.backgroundColor = 'green'
                event.target.textContent= 'Type C'
                break;
            default:
                break;
        }
        time_of_day[index].add(event.target.id.split('_')[1])
        console.log('time of day: ', time_of_day)
    }


    const foo = () => {
        alert('yes')
    }

    return (
        <div className="App">
            {/*<button onClick={closeTaskPane}>click</button>*/}
            <div id='site_top' className='row'>
                <div className='col-4'>{search}</div>
                <button onClick={(e)=>markCategories(e,0)} className='col-2' style={{marginTop: '25px'}}>Type A</button>
                <button onClick={(e)=>markCategories(e,1)} className='col-2' style={{marginTop: '25px'}}>Type B</button>
                <button onClick={(e)=>markCategories(e,2)} className='col-2' style={{marginTop: '25px'}}>Type C</button>
            </div>
            <div className='row'>
                <div id='todo_parent' className='col-4'>
                    <div id='todo_component' className='sticky-top'>
                        <Todo setToOptimize={setToOptimize} updating_tasks={tasks} trigTasks={taskIDTrig} getTasks={taskGetter} setTasks={taskSetter}/>
                    </div>
                    <div id='boo' className='row'>
                        <span id='this_week' className='this_week_chosen'>This week&nbsp;&nbsp;</span>
                        <label className="switch">
                            <input onChange={(e)=>switch_weeks(e)} id='week_switch' type="checkbox"/>
                            <span className="slider round"/>
                        </label>
                        <span id='next_week' className='week'>&nbsp;&nbsp;Next week</span>
                    </div>
                </div>

                <div id='schedule_parent' className='col-8'>
                    <div id='schedule_component'>
                        <Schedule initialSchedule={initialSchedule} table1={table1} setTable={setTable} getCategoryTable={categoryTable} setCategoryTable={setCategoryTable} setToOptimize={setToOptimize} toOptimize={toOptimize} tasksID={tasksID} getTasksID={taskIDGetter} trigTasksID={taskIDTrig} updating_tasks={tasks} getTasks={taskGetter} setTasks={taskSetter}/>
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