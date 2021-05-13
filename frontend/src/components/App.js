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
    const [categoryTrigger, setCategoryTrigger] = useState(false)
    const [categoryTable, setCategoryTable] = useState([])
    const [option, setOption] = useState(0)
    const [test, setTest] = useState(true);
    const optionRef = useRef();
    optionRef.current = option;
    const [scheduleTrigger, setScheduleTrigger] = useState(false)
    const [table1, setTable] = useState([])
    const [scheduleTable, setScheduleTable] = useState([])
    const [timeOfDay, setTimeOfDay] = useState(Array(slots_per_day*7).fill(-1))
    const timeRef = useRef();
    timeRef.current = timeOfDay;
    const [scheduleJsx, setScheduleJsx] = useState([])
    const [userID, setUserID] = useState()
    // const user_id = 2

    //TODO - check if possible to pass setTask to child component instead.
    const taskSetter = (received_tasks) => {
        setTasks(received_tasks)
    }

    const taskGetter = () => {
        fetchTasks('gettasks', userID)
    }

    const taskIDTrig = () => {
        fetchTaskID('trig', userID)
        return tasksID
    }

    const taskIDGetter = () => {
        if (tasksID.length === 0) {
            fetchTaskID('GetSchedule', userID)
        }
        return tasksID
    }

    // useEffect(() => {
    //     let i, j;
    //     let cls = []
    //     for (i=1 ; i<8;i++) {
    //         for (j = 1; j < slots_per_day + 1; j++) {
    //             cls.push(timeOfDay[slots_per_day * (i - 1) + (j - 1)])
    //         }
    //     }
    // },[timeOfDay])

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
                console.log(error)
            });
    }

    const fetchTaskID = (type, userID) => {
        console.log('taskid getter')
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
    const postCategories = (event) => {
        fetch('http://localhost:5000/tasks/PostCategories/'+userID, {
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
            setTest(false)
            paintSlots(sched)
        }
        else {
            setTest(true)
            unpaintSlots(sched)
            // TODO - prevent dragging scheduled tasks when marking categories.
        }
    }

    const getClass = (number) => {
        switch(number) {
            case 0:
                return 'type_a'
            case 1:
                return 'type_b'
            case 2:
                return 'type_c'
            default:
                return 'empty_slot'
        }
    }

    const paintSlots = (sched) => {
        let i, j;
        for (i=1 ; i<8;i++) {
            for (j=1 ; j < slots_per_day+1 ; j++) {
                // let class_name = getClass(timeOfDay[slots_per_day * (i - 1) + (j-1)])
                let node = sched.childNodes.item(0).childNodes.item(0).childNodes.item(0).childNodes.item(i).childNodes.item(j)
                // node.className = class_name//class_name
                node.ondragstart = dragStartCat
                node.ondragover = allowDropCat
                node.onclick = allowDropCat
                // node.ondrop = null
                // node.ondragleave = null
                node.draggable = true
            }
        }
    }

    const unpaintSlots = (sched) => {
        let i, j;
        console.log(sched.length)
        for (i=1 ; i<8;i++) {
            for (j=1 ; j < slots_per_day+1 ; j++) {
                let node = sched.childNodes.item(0).childNodes.item(0).childNodes.item(0).childNodes.item(i).childNodes.item(j)
                // node.className = 'empty_slot';
                node.ondragstart = dragStartSched
                node.ondragover = allowDropSched
                node.onclick = null
                node.ondrop = dropSched
                node.ondragleave = leaveDropAreaSched
                node.draggable = true
            }
        }
    }


    const dragStartCat = (event) => {
        event.dataTransfer.setData('text/plain', event.target.id);
    }

    const allowDropCat = (event) => {
        let ref = optionRef.current
        event.preventDefault();
        switch (optionRef.current){
            case 0:
                event.target.className = 'type_a'
                break;
            case 1:
                event.target.className = 'type_b'
                break;
            case 2:
                event.target.className = 'type_c'
                break;
            default:
                event.target.className = 'empty_slot'
                break;
        }
        let event_slot = event.target.id.split('_')[1]
        timeOfDay[event_slot] = ref
        setTimeOfDay(timeOfDay)
    }

    const dragStartSched = (event) => {
        event.dataTransfer.setData('text/plain', event.target.id);
    }

    const allowDropSched = (event) => {
        event.preventDefault();
        event.target.style.boxShadow = 'rgba(0, 0, 0, 0.46) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px';
        event.target.style.transition = 'box-shadow .2s linear';
    }


    const leaveDropAreaSched = (event) => {
        event.preventDefault();
        event.target.style.boxShadow = 'none';
        event.target.style.transition = 'box-shadow .2s linear';
    }

    const dropSched = (event) => {
        event.preventDefault();
        let id = event.dataTransfer.getData('text/plain');
        let dragged_element = document.getElementById(id);
        event.target.style.boxShadow = 'none';
        event.target.style.transition = 'box-shadow .2s linear';
        // TODO: remove second condition, so it will be possible to drag into an occupied slot.
        if (dragged_element.textContent && !event.target.textContent && event.target !== dragged_element) {
            event.target.textContent = dragged_element.textContent;
            dragged_element.textContent = '';
            let src_data = id.split('_')
            let dest_slot = event.target.id.split('_')[1]
            let src_slot = src_data[1]
            let tasks_id = tasksID
            let src_task_id = tasks_id[src_slot]
            tasks_id[dest_slot] = parseInt(src_task_id)
            tasks_id[src_slot] = -1
            setTaskID(tasks_id)
            // let user_id = 2
            updateTaskLocation(src_slot, dest_slot, src_task_id)
        }
        event.dataTransfer.clearData();
    }

    const updateTaskLocation = (src_slot, dest_slot, task_id) => {
        let data_to_send = {'slot_id': parseInt(src_slot), 'task_id': parseInt(task_id), 'user_id': userID}
        console.log('b!!! ', data_to_send)
        fetch('http://localhost:5000/tasks/UpdateSchedule/' + dest_slot, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data_to_send)
        })
            .then((response) => {
                if (response.status === 201) {
                    console.log("User's tasks hes been sent successfully.");
                    console.log(response.text())
                } else {
                    console.log("User's tasks hes been sent. HTTP request status code: " + response.status);
                    console.log(response.text())
                }
                console.log('respones: ', response)
            })
            .catch((error) => {
                console.error("Error while submitting task: " + error.message);
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

    const userIDHandler = (event) => {
        setUserID(parseInt(event.target.parentElement.childNodes[0].childNodes[0].value))
    }

    let search_input = <input onKeyPress={findTask} id='input' type='text' placeholder='Search Task...'/>;
    let search = <div>{search_input}</div>
    let login_input = <input onKeyPress={findTask} id='input' name='user_id_input' type='text' placeholder='Enter ID number'/>;
    let login = <div className='row'><div>{login_input}</div><button onClick={userIDHandler}>Log in</button></div>


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
                <div data-toggle="tooltip" title="Send" id='category_send_button' onClick={()=>{handleCategoriesSubmission(); showCategories(); setCategoryTrigger(!categoryTrigger)}} className='category_option'/>
                <div className='col-4'>{login}</div>
            </div>
            <div className='row'>
                <div id='show_hide_todo' className='show_hide_todo' onClick={closeTaskPane}/>
                <div id='todo_parent' className='col-4'>
                    <div id='todo_component' className='sticky-top row'>
                        <div className='col-12'>
                            <Todo userID={userID} setToOptimize={setToOptimize} updating_tasks={tasks} trigTasks={taskIDTrig} getTasks={taskGetter} setTasks={taskSetter}/>
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
                        <Schedule userID={userID} categoryTrigger={categoryTrigger} test123={test} setTimeOfDay={setTimeOfDay} timeOfDay={timeOfDay} setScheduleTable={setScheduleTable} setScheduleJsx={setScheduleJsx} scheduleJsx={scheduleJsx} initialSchedule={initialSchedule} table1={table1} setTable={setTable} getCategoryTable={categoryTable} setCategoryTable={setCategoryTable} setToOptimize={setToOptimize} toOptimize={toOptimize} tasksID={tasksID} getTasksID={taskIDGetter} trigTasksID={taskIDTrig} updating_tasks={tasks} getTasks={taskGetter} setTasks={taskSetter}/>
                    </div>
                    <div id='category_component'>
                        <Categories userID={userID} setCategoryTrigger={setCategoryTrigger} categoryTrigger={categoryTrigger} scheduleTrigger={scheduleTrigger} table1={table1} categoryTable={categoryTable} setTable={setTable} optionRef={optionRef} setCategoryTable={setCategoryTable} setTimeOfDay={setTimeOfDay} timeOfDay={timeOfDay} initialScedule={initialSchedule} scheduleJsx={scheduleJsx} setScheduleJsx={setScheduleJsx} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App