import Todo from "./Todo";
import Schedule from "./Schedule";
import SiteTop from "./SiteTop";
import Login from "./Login";
import Categories from "./Categories";
import React, {useState, useEffect, useRef} from 'react';
import { Switch, Route } from 'react-router-dom';

import '../components/App.css';


const slots_per_day = 24*2

const App = () => {
    const [tasks, setTasks] = useState([])
    const [tasksID, setTaskID] = useState([])
    const [toOptimize, setToOptimize] = useState(false)
    const [categoryTrigger, setCategoryTrigger] = useState(false)
    const [categoryTable, setCategoryTable] = useState([])
    const [rememberMe, setRememberMe] = useState();
    const [option, setOption] = useState(0)
    const optionRef = useRef();
    optionRef.current = option;
    const [scheduleTrigger, setScheduleTrigger] = useState(false)
    const [table1, setTable] = useState([])
    const [scheduleTable, setScheduleTable] = useState([])
    const schedRef = useRef()
    schedRef.current = scheduleTable;
    const [ categoryTypes, setCategoryTypes] = useState(Array(slots_per_day*7).fill(-1))
    const timeRef = useRef();
    timeRef.current =  categoryTypes;
    const [scheduleJsx, setScheduleJsx] = useState([])
    const [userID, setUserID] = useState()

    useEffect(() => {
        console.log('DUUUUDE!')
        console.log(localStorage.getItem('userID'))
        console.log(localStorage.getItem('rememberMe'))
        setUserID(localStorage.getItem('userID'))
        setRememberMe(localStorage.getItem('rememberMe'))
    }, [])
    useEffect(() => {
        if (userID !== undefined && userID !== null) {
            console.log('ID IS ', userID)
        }
    },[userID])

    //TODO - check if possible to pass setTask to child component instead.
    const taskSetter = (received_tasks) => {
        setTasks(received_tasks)
    }

    const taskGetter = () => {
        fetchTasks('gettasks', userID)
    }

    const taskIDTrig = () => {
        let day = new Date()
        trigTasks(timeToSlot(day.getDay(), null, day.getHours(), day.getMinutes()))
        console.log('TASKS ID FROM trig ', tasksID)
        return tasksID
    }

    const taskIDGetter = () => {
        if (tasksID.length === 0) {
            fetchTaskID('GetSchedule', userID)
        }
        console.log('TASKS ID FROM GETSCHEDULE ', tasksID)
        return tasksID
    }

    const timeToSlot = (day, time, hours=null, minutes=null) => {
        console.log('timeToSlot data: day, time. hours, minutes:', day, time, hours, minutes)
        if (hours == null) {
            hours = parseInt(time.substr(0, 2));
            minutes = parseInt(time.substr(3, 2));
        }
        if (minutes < 30 && minutes > 0)
            minutes = 1
        else if (minutes !== 0) {
            hours += 1
            minutes = 0
        }
        return day*48 + hours*2+minutes
    }

    const fetchTasks = (type, userID) => {
        fetch("http://localhost:5000/tasks/"+type+"/"+userID)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result['statusCode'] === 500) throw new Error('Internal server error.');
                    let tasks2 = {}
                    for (let i=0; i<result['tasks'].length; i++){
                        tasks2[result['tasks'][i]['task_id']] = result['tasks'][i]
                    }
                    setTasks(tasks2)
                })
            .catch((error) => {
                //console.log(error)
            });
    }

    const fetchTaskID = (type, userID) => {
        fetch("http://localhost:5000/tasks/"+type+"/"+userID)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result['statusCode'] === 500) throw new Error('Internal server error.');
                    setTaskID(result)
                })
            .catch((error) => {
                console.log(error)
            });
    }

    const trigTasks = (slot) => {
        console.log('TRIG ', slot)
        fetch("http://localhost:5000/tasks/trig/"+userID+"/"+slot)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result['statusCode'] === 500) throw new Error('Internal server error.');
                    setTaskID(result)
                })
            .catch((error) => {
                let popup = document.getElementById('error_popup')
                popup.animate(errorAnimation[0], errorAnimation[1])
                setTimeout(function() {
                    popup.animate(endErrorAnimation[0], endErrorAnimation[1])
                }, 3000)
            });
    }

    const errorAnimation = [[
        { 'opacity': 0, transform: 'translateY(50px)'},
        { 'opacity': 1, transform: 'translateY(0px)', visibility:'visible'}
    ], {duration: 500, fill: 'forwards', easing: 'ease-out'}];

    const endErrorAnimation = [[
        { 'opacity': 1, transform: 'translateY(0px))'},
        { 'opacity': 0, transform: 'translateY(50px)', visibility:'hidden'}
    ], { duration: 500, fill: 'forwards', easing: 'ease-in'}];

    const handleCategoriesSubmission = () => {
        removeCategories()
        setScheduleJsx(initialSchedule())
        setScheduleTrigger(!scheduleTrigger)
    }

    const removeCategories = () => {
        // let user_id = 2
        fetch('http://localhost:5000/tasks/DeleteUserCategories/'+userID, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
        })
            .then((response) => {
                if (response.status === 200) {
                    //console.log("User's tasks hes been removed successfully.");
                    // setCategoryTypes([])
                    postCategories()
                    // setCategoryTable()
                } else {
                    //console.log("Request status code: " + response.status);
                }
                //console.log('promise of remove: ',response.text())
            })
            .catch((error) => {
                console.error("Error while submitting task: " + error.message);
            });
    }

    //TODO - check how to send the data without receiving an error.
    const postCategories = (event) => {
        fetch('http://localhost:5000/tasks/PostCategories/'+userID, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify( categoryTypes)
        })
            .then((response) => {
                // setCategoryTable(response)
                if (response.status === 201) {
                    //console.log("User's tasks hes been sent successfully.");
                } else {
                    //console.log("User's tasks hes been sent. HTTP request status code: " + response.status);
                }
                //console.log(response.text())
            })
            .catch((error) => {
                console.error("Error while submitting task: " + error.message);
            });
    }


    //TODO - use this to minimize todo component.
    const closeTaskPane = () => {
        let todo_element = document.getElementById('todo_parent')
        let schedule_element = document.getElementById('schedule_parent')
        let show_hide_todo = document.getElementById('show_hide_todo')
        if (todo_element.className === 'col-4') {
            todo_element.classList.remove('col-4')
            todo_element.classList.add('gone')
            schedule_element.classList.remove('col-8')
            schedule_element.classList.add('col-12_2')
            schedule_element.classList.add('col-12')
            schedule_element.classList.add('schedule_parent_expanded')
            show_hide_todo.classList.remove('show_hide_todo')
            show_hide_todo.classList.add('show_hide_todo_reverse')
        } else {
            todo_element.classList.remove('gone')
            todo_element.classList.add('col-4')
            schedule_element.classList.remove('col-12_2')
            schedule_element.classList.remove('col-12')
            schedule_element.classList.remove('schedule_parent_expanded')
            schedule_element.classList.add('col-8')
            show_hide_todo.classList.remove('show_hide_todo_reverse')
            show_hide_todo.classList.add('show_hide_todo')
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
            content.push(<td className='td1' key={'time' + hour + ':' + minute}>{hour}:{minute}</td>);
        }
        jsx.push(<tr className='tr1' key={'tr' + 0}><th className='th1' key={'th' + 0}>Time</th>{content}</tr>);
        return jsx
    }

    const foo = (event) => {
        // TODO - if thumbtack is activated, clicking outside of day/time should close it.
        let elements = document.getElementsByClassName('thumbtack_clicked');
        // console.log(elements)
    }

    const mainPage = () => {
        console.log('main page, userid ', userID)
       return (
           <div onClick={foo} className="App d-flex flex-column">
               <SiteTop optionRef={optionRef} setCategoryTypes={setCategoryTypes}  categoryTypes={categoryTypes} setUserID={setUserID} categoryTrigger={categoryTrigger} setCategoryTrigger={setCategoryTrigger} handleCategoriesSubmission={handleCategoriesSubmission} setOption={setOption}/>
               <div id='site_body' className='row flex-grow-1'>
                   <div id='show_hide_todo' className='show_hide_todo' onClick={closeTaskPane}/>
                   <div id='todo_parent' className='col-4 col-lg-3 col-xl-3'>
                       <div id='todo_component' className='sticky-top row'>
                       <div className='col-12'>
                           <Todo tasksID={tasksID} timeToSlot={timeToSlot} userID={userID} categoryTrigger={categoryTrigger} setCategoryTrigger={setCategoryTrigger} handleCategoriesSubmission={handleCategoriesSubmission} setToOptimize={setToOptimize} updating_tasks={tasks} trigTasks={taskIDTrig} getTasks={taskGetter} setTasks={taskSetter}/>
                       </div>
                       </div>
                   </div>
                   <div id='schedule_parent' className='col-8 col-lg-9 col-xlg-9 col-8_start'>
                       <div id='schedule_component'>
                           <Schedule userID={userID} categoryTrigger={categoryTrigger} setCategoryTypes={setCategoryTypes}  categoryTypes={categoryTypes} schedRef={schedRef} scheduleTable={scheduleTable} setScheduleTable={setScheduleTable} setScheduleJsx={setScheduleJsx} scheduleJsx={scheduleJsx} initialSchedule={initialSchedule} table1={table1} setTable={setTable} getCategoryTable={categoryTable} setCategoryTable={setCategoryTable} setToOptimize={setToOptimize} toOptimize={toOptimize} tasksID={tasksID} getTasksID={taskIDGetter} trigTasksID={taskIDTrig} updating_tasks={tasks} getTasks={taskGetter} setTasks={taskSetter}/>
                           {/*<Categories userID={userID} setCategoryTrigger={setCategoryTrigger} categoryTrigger={categoryTrigger} setScheduleTrigger={setScheduleTrigger} scheduleTrigger={scheduleTrigger} table1={table1} categoryTable={categoryTable} setTable={setTable} optionRef={optionRef} setCategoryTable={setCategoryTable} setCategoryTypes={setCategoryTypes}  categoryTypes={ categoryTypes} initialScedule={initialSchedule} scheduleJsx={scheduleJsx} setScheduleJsx={setScheduleJsx} />*/}
                       </div>
                       <div id='category_component'>
                           <Categories userID={userID} setCategoryTrigger={setCategoryTrigger} categoryTrigger={categoryTrigger} setScheduleTrigger={setScheduleTrigger} scheduleTrigger={scheduleTrigger} table1={table1} categoryTable={categoryTable} setTable={setTable} optionRef={optionRef} setCategoryTable={setCategoryTable} setCategoryTypes={setCategoryTypes}  categoryTypes={ categoryTypes} initialScedule={initialSchedule} scheduleJsx={scheduleJsx} setScheduleJsx={setScheduleJsx} />
                       </div>
                   </div>
               </div>
           </div>
       );
    }

    return (
        <div className='app-routes'>
            {/*<Login setUserID={setUserID}/>*/}
            <Switch>
                <Route path='/mainPage' render={mainPage}/>
                <Route path='/' component={()=><Login rememberMe={rememberMe} setRememberMe={setRememberMe} userID={userID} setUserID={setUserID}/>}/>
                {/*<Route path='/signup' component={()=><div>HELLO</div>}/>*/}
            </Switch>
        </div>

    );
}

export default App