import Todo from "./Todo";
import Schedule from "./Schedule";
import Categories from "./Categories";
import React, {useState, useEffect, useRef} from 'react';
import '../components/App.css';


const slots_per_day = 24*2

const App = () => {
    const [tasks, setTasks] = useState([])
    const [tasksID, setTaskID] = useState([])
    const [toOptimize, setToOptimize] = useState(false)
    const [categoryTable, setCategoryTable] = useState([])
    const [option, setOption] = useState(0)
    const optionRef = useRef();
    optionRef.current = option;
    const [scheduleTrigger, setScheduleTrigger] = useState(false)
    const [table1, setTable] = useState([])
    const [scheduleTable, setScheduleTable] = useState([])
    const [timeOfDay, setTimeOfDay] = useState(Array(slots_per_day*7).fill(-1))
    const timeRef = useRef();
    timeRef.current = timeOfDay;
    const [scheduleJsx, setScheduleJsx] = useState([])
    const user_id = 1

    //TODO - check if possible to pass setTask to child component instead.
    const taskSetter = (received_tasks) => {
        setTasks(received_tasks)
    }

    const taskGetter = () => {
        fetchTasks('gettodolist', user_id)
    }

    const taskIDTrig = () => {
        fetchTaskID('trig', user_id)
        return tasksID
    }

    const taskIDGetter = () => {
        if (tasksID.length === 0) {
            fetchTaskID('GetSchedule', user_id)
        }
        return tasksID
    }

    useEffect(() => {
    },[timeOfDay])

    const fetchTasks = (type, user_id) => {
        fetch("http://localhost:5000/tasks/"+type+"/"+user_id)
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
                console.log(error)
            });
    }

    const fetchTaskID = (type, user_id) => {
        fetch("http://localhost:5000/tasks/"+type+"/"+user_id)
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

    const handleCategoriesSubmission = () => {
        removeCategories()
        setScheduleJsx(initialSchedule())
        setScheduleTrigger(!scheduleTrigger)
    }

    const removeCategories = () => {
        let user_id = 1
        fetch('http://localhost:5000/tasks/DeleteUserCategories/'+user_id, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
        })
            .then((response) => {
                if (response.status === 200) {
                    console.log("User's tasks hes been removed successfully.");
                    // setTimeOfDay([])
                    postCategories()
                    // setCategoryTable()
                } else {
                    console.log("Request status code: " + response.status);
                }
                console.log('promise of remove: ',response.text())
            })
            .catch((error) => {
                console.error("Error while submitting task: " + error.message);
            });
    }

    //TODO - check how to send the data without receiving an error.
    const postCategories = (event, user_id = 1) => {
        fetch('http://localhost:5000/tasks/PostCategories/'+user_id, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(timeOfDay)
        })
            .then((response) => {
                // setCategoryTable(response)
                if (response.status === 201) {
                    console.log("User's tasks hes been sent successfully.");
                } else {
                    console.log("User's tasks hes been sent. HTTP request status code: " + response.status);
                }
                console.log(response.text())
            })
            .catch((error) => {
                console.error("Error while submitting task: " + error.message);
            });
    }

    const changeCategoryButton = () => {
        let category_button = document.getElementById('category_button')
        if (category_button.className === 'category_button') {
            category_button.classList.remove('category_button')
            category_button.classList.add('category_button_clicked')
            category_button.title ='Back'
        } else {
            category_button.classList.remove('category_button_clicked')
            category_button.classList.add('category_button')
            category_button.title ='Modify Categories'
        }
    }

    const showCategories = () => {
        changeCategoryButton()
        let category_options = document.getElementsByClassName('category_option')
        let category_button = document.getElementById('category_button')
        let sched = document.getElementById('schedule_component')
        let cat = document.getElementById('category_component')
        let display_type;
        if (category_options[0].style.opacity === '0' || !category_options[0].style.opacity) {
            display_type = 'block'
        }
        else {
            display_type = 'none'
        }
        for (let i=0; i < category_options.length; i++) {
            // category_options[i].style.display = display_type;
            if (category_button.className === 'category_button') {
                category_options[i].style.opacity = '0';
                category_options[i].style.marginLeft = '-30px';
            } else {
                category_options[i].style.opacity = '1';
                category_options[i].style.marginLeft = '2px';
            }
        }
        if (display_type === 'block') {
            sched.style.display = 'none'
            cat.style.display = 'block'
        }
        else {
            sched.style.display = 'block'
            cat.style.display = 'none'
        }
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
        let show_hide_todo = document.getElementById('show_hide_todo')
        if (todo_element.className === 'col-4') {
            todo_element.classList.remove('col-4')
            todo_element.classList.add('gone')
            // todo_element.classList.add('disappear')
            schedule_element.classList.remove('col-8')
            schedule_element.classList.add('col-12_2')
            schedule_element.classList.add('col-12')
            schedule_element.classList.add('schedule_parent_expanded')
            show_hide_todo.classList.remove('show_hide_todo')
            show_hide_todo.classList.add('show_hide_todo_reverse')
        } else {
            todo_element.classList.remove('gone')
            // todo_element.classList.remove('disappear')
            todo_element.classList.add('col-4')
            schedule_element.classList.remove('col-12_2')
            schedule_element.classList.remove('col-12')
            schedule_element.classList.remove('schedule_parent_expanded')
            schedule_element.classList.add('col-8')
            show_hide_todo.classList.remove('show_hide_todo_reverse')
            show_hide_todo.classList.add('show_hide_todo')
        }
    }

    let search_input = <input onKeyPress={findTask} id='input' type='text' placeholder='Search Task...'/>;
    let search = <div>{search_input}</div>

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


    return (
        <div className="App">
            <div id='site_top' className='row'>
                <div className='col-4'>{search}</div>
                <div data-toggle="tooltip" title="Modify Categories" onClick={showCategories} id='category_button' className='category_button'/>
                <div data-toggle="tooltip" title="Type A" id='type_a_button' onClick={()=>setOption(0)} className='category_option'/>
                <div data-toggle="tooltip" title="Type B" id='type_b_button' onClick={()=>setOption(1)} className='category_option'/>
                <div data-toggle="tooltip" title="Type C" id='type_c_button' onClick={()=>setOption(2)} className='category_option'/>
                <div data-toggle="tooltip" title="Clear" id='clear_category_button' onClick={()=>setOption(-1)} className='category_option'/>
                {/*TODO:show indicator of sending category.*/}
                <div data-toggle="tooltip" title="Send" id='category_send_button' onClick={()=>{handleCategoriesSubmission(); showCategories();}} className='category_option'/>
            </div>
            <div className='row'>
                <div id='show_hide_todo' className='show_hide_todo' onClick={closeTaskPane}/>
                <div id='todo_parent' className='col-4'>
                    <div id='todo_component' className='sticky-top row'>
                        <div className='col-12'>
                            <Todo setToOptimize={setToOptimize} updating_tasks={tasks} trigTasks={taskIDTrig} getTasks={taskGetter} setTasks={taskSetter}/>
                        </div>
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
                <div id='schedule_parent' className='col-8 col-8_start'>
                    <div id='schedule_component'>
                        <Schedule setScheduleTable={setScheduleTable} setScheduleJsx={setScheduleJsx} scheduleJsx={scheduleJsx} initialSchedule={initialSchedule} table1={table1} setTable={setTable} getCategoryTable={categoryTable} setCategoryTable={setCategoryTable} setToOptimize={setToOptimize} toOptimize={toOptimize} tasksID={tasksID} getTasksID={taskIDGetter} trigTasksID={taskIDTrig} updating_tasks={tasks} getTasks={taskGetter} setTasks={taskSetter}/>
                    </div>
                    <div id='category_component'>
                        <Categories scheduleTrigger={scheduleTrigger} table1={table1} categoryTable={categoryTable} setTable={setTable} optionRef={optionRef} setCategoryTable={setCategoryTable} setTimeOfDay={setTimeOfDay} timeOfDay={timeOfDay} initialScedule={initialSchedule} scheduleJsx={scheduleJsx} setScheduleJsx={setScheduleJsx} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App