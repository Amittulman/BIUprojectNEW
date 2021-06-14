import Todo from "./Todo";
import Schedule from "./Schedule";
import SiteTop from "./SiteTop";
import Login from "./Login";
import Categories from "./Categories";
import React, {useState, useEffect, useRef} from 'react';
import { Switch, Route } from 'react-router-dom';

import '../components/App.css';
import {current} from "@reduxjs/toolkit";


const slots_per_day = 24*2

const App = () => {
    const [tasks, setTasks] = useState([])
    const [tasksID, setTaskID] = useState([])
    const [toOptimize, setToOptimize] = useState(false)
    const [categoryTrigger, setCategoryTrigger] = useState(false)
    const [categoryTable, setCategoryTable] = useState([])
    const [categories, setCategories] = useState([]);
    const [rememberMe, setRememberMe] = useState();
    const [option, setOption] = useState(0)
    const [days, setDays] = useState(['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
    const [todoMinimized, setTodoMinimized] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [todoIsLoaded, setTodoIsLoaded] = useState(false);
    const [updated_tasks, setUpdatedTasks] = useState({})
    const updatedRef = useRef();
    updatedRef.current = updated_tasks;
    const optionRef = useRef();
    optionRef.current = option;
    const taskRef = useRef();
    taskRef.current = tasks;
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
        window.addEventListener('click', detectOutsideClicking)
        console.log(localStorage.getItem('userID'))
        console.log(localStorage.getItem('rememberMe'))
        setUserID(localStorage.getItem('userID'))
        setRememberMe(localStorage.getItem('rememberMe'))
        // resizeResponse()

    }, [])

    useEffect(() => {
        console.log('TASKS !!! ', tasks)
    },[tasks])

    useEffect(() => {
        if (userID !== undefined && userID !== null) {
            console.log('ID IS ', userID)
        }
    },[userID])

    const checkClick = (e,i) => {
        let current_pinnedd = document.getElementById('pinned_calendar'+i)
        let time = document.getElementById('pinned_choose_time'+i)
        if (current_pinnedd !== null && time!== null && e.target.id !== 'pinned_choose_day'+i && e.target.id !== 'pinned_choose_time'+i && e.target.id !== 'thumbtack'+i ) {
            current_pinnedd.style.visibility = 'hidden'
            current_pinnedd.style.opacity = '0'
            // console.log(current_pinnedd, time.value)
        }
    }

    const detectOutsideClicking = (e) => {
        let i;
        for (i of Object.keys(taskRef.current)) {
            checkClick(e,i)
        }
        for (i of Object.keys(updatedRef.current)) {
            checkClick(e,i)
        }
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
        if (minutes <= 30 && minutes > 0)
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
                    if (Object.keys(tasks2).length === 0) {
                        setTodoIsLoaded(true)
                    }
                    setTasks(tasks2)
                })
            .catch((error) => {
                console.log(error)
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
        console.log('TRIG ', tasks)
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
        { 'opacity': 0, transform: 'translateY(50px)', zIndex:'0'},
        { 'opacity': 1, transform: 'translateY(-20px)', visibility:'visible', zIndex:'1000100'}
    ], {duration: 500, fill: 'forwards', easing: 'ease-out'}];

    const endErrorAnimation = [[
        { 'opacity': 1, transform: 'translateY(-20px))', zIndex:'1000100'},
        { 'opacity': 0, transform: 'translateY(50px)', visibility:'hidden', zIndex:'0'}
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
                    PostCategorySlots()
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
    const PostCategorySlots = (event) => {
        fetch('http://localhost:5000/tasks/PostCategorySlots/'+userID, {
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


    const closeTaskPane = () => {
        let todo_element = document.getElementById('todo_parent')
        let schedule_element = document.getElementById('schedule_parent')
        let show_hide_todo = document.getElementById('show_hide_todo')
        if (!todoMinimized) {
            setTodoMinimized(true)
            todo_element.className = 'gone'
            schedule_element.className = 'col-12_2 col schedule_parent_expanded'
            show_hide_todo.className = 'show_hide_todo_reverse'

        } else {
            setTodoMinimized(false)
            todo_element.className = 'col-4'
            schedule_element.className = 'col-8'
            show_hide_todo.className = 'show_hide_todo'
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

    const fixPresentation = (mobile) => {
        let sched = document.getElementById('schedule_parent')
        let todo = document.getElementById('todo_component')
        // let todo_parent = document.getElementById('todo_parent')
        if (!sched || !todo) return
        if (mobile.matches){
            if (collapsed) {
                sched.className = 'row2'
                todo.className = 'gone'
            } else {
                sched.className = 'collapsed_row2'
                todo.className = 'sticky-top row tst2'
            }
            setDays(['Time', 'Su.', 'Mo.', 'Tu.', 'We.', 'Th.', 'Fr.', 'Sa.'])
        } else {
            sched.className = 'col col-8_start'
            todo.className = 'sticky-top row'
            setDays(['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
        }
        //TODO - move cat brush to the left, change arrow direction, when expanding it open todo, make sure todo looks
        // good when opening it (above sched).
    }

    const resizeResponse = () => {
        let mobile = window.matchMedia('(max-width: 800px)')
        fixPresentation(mobile)
        mobile.addEventListener('load',fixPresentation)
    }

    const mainPage = () => {
        console.log('main page, userid ', userID)
        window.onresize = resizeResponse;
       return (
           <div className="App d-flex flex-column">
               <SiteTop categories={categories} setCategories={setCategories} optionRef={optionRef} setCategoryTypes={setCategoryTypes}  categoryTypes={categoryTypes} userID={userID} setUserID={setUserID} categoryTrigger={categoryTrigger} setCategoryTrigger={setCategoryTrigger} handleCategoriesSubmission={handleCategoriesSubmission} setOption={setOption}/>
               <div id='site_body' className='row flex-grow-1'>
                   {/*<div id='show_hide_todo' className='show_hide_todo' onClick={closeTaskPane}/>*/}
                   <div id='todo_parent' className='col-4'>
                       <div id='todo_component' className='sticky-top row'>
                       <div className='tst col-12'>
                           <Todo categories={categories} setUpdatedTasks={setUpdatedTasks} updated_tasks={updated_tasks} tasksID={tasksID} timeToSlot={timeToSlot} userID={userID} isLoaded={todoIsLoaded} setIsLoaded={setTodoIsLoaded} errorAnimation={errorAnimation} endErrorAnimation={endErrorAnimation} categoryTrigger={categoryTrigger} setCategoryTrigger={setCategoryTrigger} handleCategoriesSubmission={handleCategoriesSubmission} setToOptimize={setToOptimize} updating_tasks={tasks} trigTasks={taskIDTrig} getTasks={taskGetter} setTasks={setTasks}/>
                       </div>
                       </div>
                   </div>
                   <div id='schedule_parent' className='col col-8_start'>
                       <div id='schedule_component'>
                           <Schedule days={days} setDays={setDays} categories={categories} setCategories={setCategories} timeToSlot={timeToSlot} userID={userID} categoryTrigger={categoryTrigger} setCategoryTypes={setCategoryTypes}  categoryTypes={categoryTypes} schedRef={schedRef} scheduleTable={scheduleTable} setScheduleTable={setScheduleTable} setScheduleJsx={setScheduleJsx} scheduleJsx={scheduleJsx} initialSchedule={initialSchedule} table1={table1} setTable={setTable} getCategoryTable={categoryTable} setCategoryTable={setCategoryTable} setToOptimize={setToOptimize} toOptimize={toOptimize} tasksID={tasksID} getTasksID={taskIDGetter} trigTasksID={taskIDTrig} updating_tasks={tasks} getTasks={taskGetter} setTasks={setTasks}/>
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