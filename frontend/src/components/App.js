import Todo from "./Todo";
import Schedule from "./Schedule";
import SiteTop from "./SiteTop";
import Login from "./Login";
import Categories from "./Categories";
import React, {useState, useEffect, useRef} from 'react';
import { Switch, Route } from 'react-router-dom';
import '../components/App.css';

const SLOTS_PER_DAY = 24*2
const HALF_HOUR = 30

const App = () => {
    const [tasks, setTasks] = useState([]) // Dictionary of all user tasks, received from DB.
    const [tasksID, setTaskID] = useState([]) // List of all tasks ids, needed to put in schedule.
    const [categoryTrigger, setCategoryTrigger] = useState(false) // A flag for category change(add/mod/rem).
    const [categoryTable, setCategoryTable] = useState([]) // A list of all categories for each table cell.
    const [categories, setCategories] = useState([]); // A list of all user's categories (types).
    const [rememberMe, setRememberMe] = useState(); // A state for remember me checkbox.
    const [pastDue, setPastDue] = useState({})
    const [option, setOption] = useState(0) // A chosen color to paint slots (resembles a category).
    // A state for weekdays. changes according to screen size.
    const [days, setDays] = useState(['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
    const [todoMinimized, setTodoMinimized] = useState(false); // State for size of to do list.
    const [todoIsLoaded, setTodoIsLoaded] = useState(false); // State for loaded status of to do list.
    const [updated_tasks, setUpdatedTasks] = useState({}) // Dictionary of all updated tasks (add/mod/rem).
    const updatedRef = useRef(); // Gives updated value of updated tasks.
    updatedRef.current = updated_tasks;
    const optionRef = useRef(); // Gives updated value of chosen category option.
    optionRef.current = option;
    const taskRef = useRef(); // Gives updated tasks.
    taskRef.current = tasks;
    const [scheduleTrigger, setScheduleTrigger] = useState(false) // State for change in schedule (dragging).
    const [table1, setTable] = useState([]) //TODO remove
    const [scheduleTable, setScheduleTable] = useState([]) // A list of all table elements.
    const schedRef = useRef() // Gives updated schedule elements.
    schedRef.current = scheduleTable;
    const [week, setWeek] = useState(false);
    // A list with all category types.
    const [categoryTypes, setCategoryTypes] = useState(Array(SLOTS_PER_DAY*7).fill(-1))
    const timeRef = useRef(); // Gives updated category types elements.
    timeRef.current =  categoryTypes;
    // A state of all schedule jsx elements (how they appear on screen).
    const [scheduleJsx, setScheduleJsx] = useState([])
    const [userID, setUserID] = useState() // State of user id (info).
    const [categoryChanged, setCategoryChanged] = useState(false); // State for changing categories.
    // State for this moment (this week=this moment, next week=sunday, 00:00).
    const [scheduleMoment, setScheduleMoment] = useState();

    // On main page load, get userID and "remember me" from local storage.
    useEffect(() => {
        window.addEventListener('click', detectOutsideClicking)
        setUserID(localStorage.getItem('userID'))
        setRememberMe(localStorage.getItem('rememberMe'))

        let date = new Date();
        let slot = timeToSlot(date.getDay(), null, date.getHours(), date.getMinutes())
        setScheduleMoment(slot);
        // In case the element does not contain any text (login phase for exapmle).
        if (document.getElementById('schedule_for_next_week_text') === null) return null;

        // update relevant time according to local storage.
        if (localStorage.getItem('nextWeek') === null || localStorage.getItem('nextWeek').includes('f')) {

            let slot = timeToSlot(date.getDay(), null, date.getHours(), date.getMinutes())
            setScheduleMoment(slot);
            localStorage.setItem('nextWeek', 'f_'+slot)
            document.getElementById('schedule_for_next_week_text').innerText = 'This Week'
        }
        else  {
            setScheduleMoment(0);
            localStorage.setItem('nextWeek', 't_'+slot)
            document.getElementById('schedule_for_next_week_text').innerText = 'Next Week'
        }
    }, [])

    // Hides a pinned popup.
    const checkClick = (e,i) => {
        let current_pinned = document.getElementById('pinned_calendar'+i)
        let time = document.getElementById('pinned_choose_time'+i)
        if (current_pinned !== null && time!== null && e.target.id !== 'pinned_choose_day'+i && e.target.id !== 'pinned_choose_time'+i && e.target.id !== 'thumbtack'+i ) {
            current_pinned.style.visibility = 'hidden'
            current_pinned.style.opacity = '0'
        }
    }

    //Detection of clicking outside an element.
    const detectOutsideClicking = (e) => {
        let i;
        // Checking in loaded tasks
        for (i of Object.keys(taskRef.current)) {
            checkClick(e,i)
        }
        // Checking in new added tasks.
        for (i of Object.keys(updatedRef.current)) {
            checkClick(e,i)
        }
    }

    // Task getter function.
    const taskGetter = () => {
        fetchTasks('gettasks', userID)
    }

    // Calling trig API, with current day as beginning slot parameter.
    const taskIDTrig = () => {
        trigTasks(scheduleMoment)
        return tasksID
    }

    // Getter function for receiving schedule.
    const taskIDGetter = () => {
        if (tasksID.length === 0) {
            fetchTaskID('GetSchedule', userID)
        }
        return tasksID
    }

    //Graying out an element (css design wise)
    const grayIt = (elm) => {
        elm.style.pointerEvents = 'none';
        elm.style.opacity = '0.3';
    }

    //Graying out an element (css design wise)
    const ungrayIt = (elm) => {
        elm.style.pointerEvents = '';
        elm.style.opacity = '1';
    }

    // Graying out elements, depending on place clicked.
    const grayOutElements = (edit_cat=false) => {
        // If on edit category pane.
        if (edit_cat) {
            grayIt(document.getElementById('schedule_parent'));
            grayIt(document.getElementById('category_send_button'));
            grayIt(document.getElementById('category_button'));
            grayIt(document.getElementById('add_category_button'));
            grayIt(document.getElementById('clear_category_button'));
            grayIt(document.getElementById('added_button_0'));
            grayIt(document.getElementById('added_button_1'));
            grayIt(document.getElementById('added_button_2'));
            grayIt(document.getElementById('added_button_3'));
            grayIt(document.getElementById('added_button_4'));
            grayIt(document.getElementById('added_button_5'));
        }
        grayIt(document.getElementById('schedule_for_next_week'));
        grayIt(document.getElementById('schedule_for_next_week_text'));
        grayIt(document.getElementById('site_logo'));
        grayIt(document.getElementById('todo_parent'));
    }

    // Graying out elements, depending on place clicked.
    const ungrayOutElements = (icons=false) => {
        // Ungraying rest of grayed out areas (exiting category editing mode).
        if (icons) {
            ungrayIt(document.getElementById('schedule_for_next_week'));
            ungrayIt(document.getElementById('schedule_for_next_week_text'));
            ungrayIt(document.getElementById('site_logo'));
            ungrayIt(document.getElementById('todo_parent'));
        }
        ungrayIt(document.getElementById('schedule_parent'));
        ungrayIt(document.getElementById('add_category_button'));
        ungrayIt(document.getElementById('clear_category_button'));
        ungrayIt(document.getElementById('category_send_button'));
        ungrayIt(document.getElementById('category_button'));
        ungrayIt(document.getElementById('added_button_0'));
        ungrayIt(document.getElementById('added_button_1'));
        ungrayIt(document.getElementById('added_button_2'));
        ungrayIt(document.getElementById('added_button_3'));
        ungrayIt(document.getElementById('added_button_4'));
        ungrayIt(document.getElementById('added_button_5'));
        ungrayIt(document.getElementById('add_category_button'));
    }

    //Converting time to a slot number.
    const timeToSlot = (day, time, hours=null, minutes=null) => {
        if (hours == null) {
            hours = parseInt(time.substr(0, 2));
            minutes = parseInt(time.substr(3, 2));
        }
        // Round minutes down.
        if (minutes <= HALF_HOUR && minutes > 0)
            minutes = 1
        // Round hour up and minutes down (in case minutes > 30).
        else if (minutes !== 0) {
            hours += 1
            minutes = 0
        }
        return day*48 + hours*2+minutes
    }

    // Fetching task list of a specific user.
    const fetchTasks = (type, userID) => {
        fetch("http://localhost:5000/tasks/"+type+"/"+userID)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result['statusCode'] === 500) throw new Error('Internal server error.');
                    let temp_tasks = {}
                    for (let i=0; i<result['tasks'].length; i++){
                        temp_tasks[result['tasks'][i]['task_id']] = result['tasks'][i]
                    }
                    if (Object.keys(temp_tasks).length === 0) {
                        setTodoIsLoaded(true)
                    }
                    setTasks(temp_tasks);
                })
            .catch((error) => {
                console.error('error in get task: ', error)
            });
    }

    // Fetching task id list of a specified user.
    const fetchTaskID = (type, userID) => {
        fetch("http://localhost:5000/tasks/"+type+"/"+userID)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result['statusCode'] === 500) throw new Error('Internal server error.');
                    setTaskID(result)
                })
            .catch((error) => {
                console.error('error in fetch tasks id: ', error)
            });
    }

    // An animation or error in schedule generation.
    const showErrorMessage = () => {
        let popup = document.getElementById('error_popup')
        popup.innerText = 'Could not generate schedule';
        popup.animate(errorAnimation[0], errorAnimation[1])
        setTimeout(function() {
            popup.animate(endErrorAnimation[0], endErrorAnimation[1])
        }, 3000)
    }

    // Remove red marking on all elements and tasks.
    const unmarkTasksWithErrors = () => {
        for (let id in taskRef.current) {
            let recurrences = document.getElementById('recurrings' + id);
            let constraints = document.getElementById('constraints' + id);
            let categories = document.getElementById('category_id' + id);
            let task = document.getElementById('task' + id);
            recurrences.classList.remove('thumbtack_error');
            constraints.classList.remove('task_error');
            categories.classList.remove('task_error');
            task.classList.replace('closed_task_error', 'closed_task');
            task.classList.replace('expanded_task_daytime_error', 'expanded_task_daytime');
            task.classList.replace('expanded_task_error', 'expanded_task');
        }
    }

    // Marking errors in specific properties of specific tasks.
    const markTasksWithErrors = (err_tasks) => {
        let i;
        for (i=0; i<err_tasks.length; i++) {
            let task = document.getElementById('task' + err_tasks[i][0]);
            // Showing error of a specific task.
            task.classList.replace('closed_task', 'closed_task_error');
            task.classList.replace('expanded_task', 'expanded_task_error');
            task.classList.replace('expanded_task_daytime', 'expanded_task_daytime_error');
            let recurrences = document.getElementById('recurrings' + err_tasks[i][0]);
            let constraints = document.getElementById('constraints' + err_tasks[i][0]);
            let categories = document.getElementById('category_id' + err_tasks[i][0]);
            // Showing error in pinning task.
            if (err_tasks[i][1] === 1)
                recurrences.classList.add('thumbtack_error');
            // Showing error in constraints.
            if (err_tasks[i][2] === 1)
                constraints.classList.add('task_error');
            // Showing error in category.
            if (err_tasks[i][3] === 1)
                categories.classList.add('task_error');
        }
    }

    // Trig API. Receiving calculated schedule.
    const trigTasks = (slot) => {
        fetch("http://localhost:5000/tasks/trig/"+userID+"/"+slot)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result['statusCode'] === 500) throw new Error('Internal server error.');
                    // If it was not possible to generate schedule.
                    if (result[0] === null) {
                        console.error('Error in trig: ', result)
                        showErrorMessage();
                        markTasksWithErrors(result[1]);
                        return;
                    } else {
                        unmarkTasksWithErrors();
                    }
                    setTaskID(result[0])
                })
            .catch((error) => {
                console.error('error in trig: ', error);
            });
    }

    // Task error message animations.
    const errorAnimation = [[
        { 'opacity': 0, transform: 'translateY(50px)', zIndex:'0'},
        { 'opacity': 1, transform: 'translateY(-20px)', visibility:'visible', zIndex:'1000100'}
    ], {duration: 500, fill: 'forwards', easing: 'ease-out'}];

    const endErrorAnimation = [[
        { 'opacity': 1, transform: 'translateY(-20px))', zIndex:'1000100'},
        { 'opacity': 0, transform: 'translateY(50px)', visibility:'hidden', zIndex:'0'}
    ], { duration: 500, fill: 'forwards', easing: 'ease-in'}];

    // Actions taken when submitting categories changes.
    const handleCategoriesSubmission = () => {
        // Removing deleted categories from DB.
        removeCategories()
        setScheduleJsx(initialSchedule())
        setScheduleTrigger(!scheduleTrigger)
    }

    // Removing category from DB.
    const removeCategories = () => {
        fetch('http://localhost:5000/tasks/DeleteUserCategories/'+userID, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
        })
            .then((response) => {
                if (response.status === 200) {
                    PostCategorySlots()
                }
            })
            .catch((error) => {
                console.error("Error while submitting task: " + error.message);
            });
    }

    // Post updated categories.
    const PostCategorySlots = () => {
        fetch('http://localhost:5000/tasks/PostCategorySlots/'+userID, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(categoryTypes)
        })
            .then((response) => {
                if (response.status === 201) {
                    console.log("User's tasks hes been sent successfully.");
                } else {
                    console.error("User's tasks hes been sent. HTTP request status code: " + response.status);
                }
            })
            .catch((error) => {
                console.error("Error while submitting task: " + error.message);
            });
    }

    // Closing task pane (minimizing).
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

    // Creating initial table jsx of time in schedule.
    const initialSchedule = () => {
        let jsx = []
        let hour;
        let minute = 0;
        let content = []
        // creating value for each time of day and updating in the relevant slot.
        for (let j = 0; j < SLOTS_PER_DAY; j++) {
            hour = Math.floor(j / 2);
            minute = HALF_HOUR * (j % 2);
            if (hour < 10) hour = '0' + hour
            if (minute === 0) minute = '00'
            content.push(<td className='td1' key={'time' + hour + ':' + minute}>{hour}:{minute}</td>);
        }
        jsx.push(<tr className='tr1' key={'tr' + 0}><div className={'th_parent'}><th className='th1' key={'th' + 0}>Time</th></div>{content}</tr>);
        return jsx
    }

    // Iterate slots and track all past due tasks.
    const updatePastDueTasks = () => {
        let todays_slot = scheduleMoment
        let i = 0;
        while (i < todays_slot) {
            if (tasksID[i] !== -1) {
                let past_due_task_id = tasksID[i]
                setPastDue(data=>({...data,[past_due_task_id]:1}))
            }
            i += 1
        }
    }

    // Fix representation, according to screen size.
    const fixPresentation = (mobile) => {
        let sched = document.getElementById('schedule_parent')
        let todo = document.getElementById('todo_component')
        if (!sched || !todo) return
        // Suited for mobile.
        if (mobile.matches){
            sched.className = 'collapsed_row2'
            todo.className = 'sticky-top row tst2'
            setDays(['Time', 'Su.', 'Mo.', 'Tu.', 'We.', 'Th.', 'Fr.', 'Sa.'])
        } else {
            sched.className = 'col col-8_start'
            todo.className = 'sticky-top row'
            setDays(['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
        }
    }

    // Dynamically resizing screen.
    const resizeResponse = () => {
        let mobile = window.matchMedia('(max-width: 800px)')
        fixPresentation(mobile)
        mobile.addEventListener('load',fixPresentation)
    }

    // Main website page.
    const mainPage = () => {
        window.onresize = resizeResponse;
       return (
           <div className="App d-flex flex-column">
               <SiteTop ungrayOutElements={ungrayOutElements} grayOutElements={grayOutElements} setWeek={setWeek} week={week} setScheduleJsx={setScheduleJsx} scheduleJsx={scheduleJsx} timeRef={timeRef} setScheduleMoment={setScheduleMoment} timeToSlot={timeToSlot} setCategoryChanged={setCategoryChanged} categories={categories} setCategories={setCategories} optionRef={optionRef} setCategoryTypes={setCategoryTypes}  categoryTypes={categoryTypes} userID={userID} setUserID={setUserID} categoryTrigger={categoryTrigger} setCategoryTrigger={setCategoryTrigger} handleCategoriesSubmission={handleCategoriesSubmission} setOption={setOption}/>
               <div id='site_body' className='row flex-grow-1'>
                   {/*<div id='show_hide_todo' className='show_hide_todo' onClick={closeTaskPane}/>*/}
                   <div id='todo_parent' className='col-4'>
                       <div id='todo_component' className='sticky-top row'>
                       <div className='tst col-12'>
                           <Todo updatePastDueTasks={updatePastDueTasks} pastDue={pastDue} setPastDue={setPastDue} week={week} setWeek={setWeek} setCategoryChanged={setCategoryChanged} scheduleMoment={scheduleMoment} categoryChanged={categoryChanged} categories={categories} setUpdatedTasks={setUpdatedTasks} updated_tasks={updated_tasks} tasksID={tasksID} timeToSlot={timeToSlot} userID={userID} isLoaded={todoIsLoaded} setIsLoaded={setTodoIsLoaded} errorAnimation={errorAnimation} endErrorAnimation={endErrorAnimation} categoryTrigger={categoryTrigger} setCategoryTrigger={setCategoryTrigger} handleCategoriesSubmission={handleCategoriesSubmission} updating_tasks={tasks} trigTasks={taskIDTrig} getTasks={taskGetter} setTasks={setTasks}/>
                       </div>
                       </div>
                   </div>
                   <div id='schedule_parent' className='col col-8_start'>
                       <div id='schedule_component'>
                           <Schedule updatePastDueTasks={updatePastDueTasks} pastDue={pastDue} setPastDue={setPastDue} scheduleMoment={scheduleMoment} days={days} setDays={setDays} categories={categories} setCategories={setCategories} timeToSlot={timeToSlot} userID={userID} categoryTrigger={categoryTrigger} setCategoryTypes={setCategoryTypes}  categoryTypes={categoryTypes} schedRef={schedRef} scheduleTable={scheduleTable} setScheduleTable={setScheduleTable} setScheduleJsx={setScheduleJsx} scheduleJsx={scheduleJsx} initialSchedule={initialSchedule} table1={table1} setTable={setTable} getCategoryTable={categoryTable} setCategoryTable={setCategoryTable} tasksID={tasksID} getTasksID={taskIDGetter} trigTasksID={taskIDTrig} updating_tasks={tasks} getTasks={taskGetter} setTasks={setTasks}/>
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

    // Routing between login/signup pages to main page.
    return (
        <div className='app-routes'>
            <Switch>
                <Route path='/mainPage' render={mainPage}/>
                <Route path='/' component={()=><Login setScheduleMoment={setScheduleMoment} timeToSlot={timeToSlot} rememberMe={rememberMe} setRememberMe={setRememberMe} userID={userID} setUserID={setUserID}/>}/>
            </Switch>
        </div>

    );
}

export default App