import './Todo.css';
import React, {useState, useEffect, useRef} from 'react';
import "react-datepicker/dist/react-datepicker.css";

import "react-datetime/css/react-datetime.css";

const slots_per_day = 24*2


const Todo = (props) => {
  const [tasks_jsx, setTasksJsx] = useState(new Set())
  const [tasks, setTasks] = useState([])
  const [removed_tasks, setRemovedTasks] = useState([])
  const [task_number, setTaskNumber] = useState(10000)
  const [trigger, setTrigger] = useState(false)
  const [pastDue, setPastDue] = useState({})
  const [chosenDays, setChosenDays] = useState({});
  const daysRef = useRef();
  daysRef.current = chosenDays;
  const pastDueRef = useRef();
  pastDueRef.current = pastDue;
  const [firstRender, setFirstRender] = useState(true)
  const [todoIDs, setTodoIDs] = useState({})
  const todoIDRef = useRef();
  todoIDRef.current = todoIDs;
  const firstUpdate = useRef(true)
  const updatedRef = useRef();
  updatedRef.current = props.updated_tasks;
  const removedRef = useRef();
  removedRef.current = removed_tasks;
  const jsxRef = useRef();
  jsxRef.current = tasks_jsx;
  const containerRef = useRef();
  const tasksRef = useRef();
  tasksRef.current = tasks
  const numRef = useRef()
  numRef.current = task_number

  //Adding JSX
  useEffect(() => {
    if (!props.userID || props.userID === 'null') return
    props.getTasks()
  }, [props.userID]);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }
    if (Object.keys(props.updating_tasks).length === 0) return
    setTasks(props.updating_tasks)
  }, [props.updating_tasks])

  useEffect(() => {
    console.log('TASKS: ', tasks)
  }, [tasks])

  useEffect(() => {
    if (tasks.length === 0 || props.categories.length === 0) {
      return
    }
    if (!props.isLoaded) {
      props.setIsLoaded(true)
      // Load existing tasks.
      if (Object.keys(tasks).length > 0) {
        let new_task_chunk = [];
        for (let key in tasks) {
          new_task_chunk.push(addTask(key, tasks[key]))
          //debugger
          // console.log('TASK IS NOW ', jsxRef.current)
        }
        setTasksJsx(new_task_chunk)
        // updatePastDueTasks()
      }
      // TODO - put it at the bottom. When loading tasks it will always be the bottom task container.
      // addTask(i+1)
      setTaskNumber(task_number+2)
    }
  }, [tasks, props.categories])

  useEffect(() => {
    if (props.tasksID.length === 0) return
    updatePastDueTasks()
  }, [props.tasksID])

  useEffect(() => {
    let empty_element = document.getElementById('empty_todo')
    let loading_element = document.getElementById('loading_todo')
    if (Object.keys(tasks_jsx).length === 0) {
      //console.log('loaded?', isLoaded)
      if (!props.isLoaded) {
        // loading_element.className = 'loader'
        // empty_element.className = ''
        // empty_element.textContent = ''
      } else {
        loading_element.className = ''
        empty_element.className = 'empty_todo!'
        empty_element.textContent = 'Add tasks!'
      }
    } else {
      loading_element.className = ''
      empty_element.textContent = ''
    }
  },[tasks_jsx, props.isLoaded])

  const bin_task = (event,i, reschedule=false) => {
    //console.log('bin task')
    let timer;
    // Animation deletion, depending on closed/opened task.
    if (reschedule || event.currentTarget.parentNode.childNodes[2].className.startsWith('closed')) {
      document.getElementById('task_container'+i).classList.add('removed_container')
      timer = 380
    } else if (event.currentTarget.parentNode.childNodes[2].className.endsWith('daytime')) {
      document.getElementById('task_container'+i).classList.add('removed_container_expanded_daytime')
      timer = 600
    } else {
      document.getElementById('task_container'+i).classList.add('removed_container_expanded')
      timer = 580
    }
    // Removing presented task from screen.
    setTimeout(()=> {
      setTasksJsx(jsxRef.current.filter(item => item.props.id !== 'task_container' + i))
    }, timer)

    // Removing deleted task from task list, if exists (if was edited beforehand).
    for (let [key, value] of Object.entries(props.updated_tasks)) {
      if (value['temp_task_id'] === i) {
        let clone = props.updated_tasks;
        delete clone[key]
        props.setUpdatedTasks(clone)
      }
    }
    if (tasksRef.current[i] !== undefined) {
      setRemovedTasks(prevArr => [...prevArr, tasksRef.current[i].task_id])
    }
  }

  const anyNotHidden = (index) => {
    console.log('check any surprises ', daysRef.current[index])
    return daysRef.current[index] !== 0
  }

  const expandTask = (event, task, index) => {
    let hyperExtended = anyNotHidden(index)
    let clicked_task = document.getElementById(task.props.id)
    if (event.target.className === 'expand_icon') {
      event.target.className = 'collapse_icon'
      if (clicked_task.className === 'closed_task_error') {
        if (hyperExtended) {
          clicked_task.className = 'expanded_task_daytime_error'
        } else {
          clicked_task.className = 'expanded_task_error'
        }
      } else if (hyperExtended) {
        clicked_task.className = 'expanded_task_daytime'
      } else {
        clicked_task.className = 'expanded_task'
      }
    }
    else {
      event.target.className = 'expand_icon'
      if (clicked_task.className === 'expanded_task_error' || clicked_task.className === 'expanded_task_daytime_error') {
        clicked_task.className = 'closed_task_error'
      } else
        clicked_task.className = 'closed_task'
    }
  }

  const showPinnedCalendar = (e, index) => {
    let calendar = document.getElementById('pinned_calendar'+index);
    let day = document.getElementById('pinned_choose_day'+index);
    let time = document.getElementById('pinned_choose_time'+index);
    let thumbtack = document.getElementById('thumbtack'+index);
    thumbtack.title = '';
    // Cancelling pin.
    if (thumbtack.className.includes('thumbtack_done')) {
      day.value = '';
      time.value = null;
      let temp_arr = updatedRef.current
      if (temp_arr[index] !== undefined) {
        temp_arr[index].pinned_slot = null
        props.setUpdatedTasks(temp_arr)
        // Updating pin to task.
      } else {
        update_task(index)
        let task_copy = Object.assign({}, tasks[index])
        delete task_copy['task_id']
        task_copy['temp_task_id'] = index
        temp_arr[index] = {...task_copy, 'pinned_slot': null}
      }
      thumbtack.className = 'col-1 thumbtack'
      return;
    }
    // Opening/closing pinned.
    if (calendar.style.visibility === 'visible') {
      calendar.style.visibility = 'hidden';
      calendar.style.opacity = '0';
    }    else {
      calendar.style.visibility = 'visible';
      calendar.style.opacity = '1';
    }
    let pin = document.getElementById('thumbtack'+index);
    // Pin design.
    if (pin.classList.contains('thumbtack_done')) {
      pin.classList.remove('thumbtack_done');
      pin.classList.add('thumbtack');
    }
    pin.classList.add('col-1');
  }

  const getDay = (slot_number, i) => {
    if (slot_number === null) return ''
    return parseInt(parseInt(slot_number)/48)
  }

  const getTime = (slot_number) => {
    let day = parseInt(parseInt(slot_number)/48)
    let daily_task_number = slot_number - slots_per_day * day
    let hour = Math.floor(daily_task_number/2)
    let minute;
    if (daily_task_number % 2 === 0) minute = '00'
    else minute = '30'
    return hour+':'+minute+':00'
  }

  const recurrenceIconChange = (e, i) => {
    let recurrence = (parseInt(e.target.className.slice(-1)[0] )+ 1).toString()
    if (recurrence === '8' || isNaN(recurrence))
      recurrence = '1';
    e.target.className = 'recurrence recurrence'+recurrence
  }

  const updatePastDueTasks = () => {
    let date = new Date()
    let todays_slot = props.scheduleMoment
    let i = 0;
    while (i < todays_slot) {
      if (props.tasksID[i] !== -1) {
        let past_due_task_id = props.tasksID[i]
        console.log('Past due task is: ', past_due_task_id)
        setPastDue(data=>({...data,[past_due_task_id]:1}))
      }
      i += 1
    }
  }

  const getDuration = (value) => {
    if (value/60 > 3 || value/60 < 0.5){
      return 'null'
    }
    return value/60
  }

  const slotToTime = (slot, event) => {
    if (event.target.title !== '') return;
    let days_dct = {0:  'Sunday', 1:'Monday', 2:'Tuesday', 3:'Wednesday', 4:'Thursday', 5:'Friday', 6:'Saturday'}
    if (slot === null) {
      event.target.title = '';
      return;
    }
    let day = Math.floor(slot / 48);
    let day_name = days_dct[Math.floor(slot / 48)]
    let hour = Math.floor((slot - (day * 48)) / 2);
    let minute;
    if ((slot - (day * 48) / 2 ) % 2 === 0)
      minute = '00';
    else
      minute = '30';
    event.target.title = day_name + ', ' + hour + ':' + minute;
  }

  const unpinTask = (event, i) => {
    let pin = document.getElementById('thumbtack'+i);
    props.updated_tasks[i]['pinned_slot'] = null;
    pin.className = 'thumbtack'
  }

  const showInputError = (e, enter) => {
    let x = e.target.childNodes
    let y = e.target.childNodes.length;
    let shnips;
    debugger
    let err = e.target.classList.contains('task_error') || e.currentTarget.classList.contains('task_error') || e.target.classList.contains('thumbtack_error')
    if (!err) return;
    //TODO add parent and then child as well
    let chosen_class;
    if (e.target.childNodes.length > 1) {
      chosen_class = e.target.childNodes[e.target.childNodes.length-1]
      shnips = e.target.childNodes
    } else {
      chosen_class = e.target.parentNode.childNodes[e.target.parentNode.childNodes.length-1]
      shnips = e.target.parentNode.childNodes
    }
    // shnips = shnips[0].textContent
    // shnips = shnips[0]
    let tag = chosen_class.tagName

    if (!chosen_class || e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL'|| e.target.classList.contains('row') || e.target.classList.contains('spacing_days')|| e.target.classList.contains('day')) return
    debugger
    // this function will be called when hovering a certain task element (added when error received)
    if (enter) {
      chosen_class.className = 'task_element_input_error'
      setTimeout(()=> {
        if (chosen_class.classList === undefined) return
        chosen_class.classList.replace('task_element_input_error','hidden_task_element_input_error')
      }, 4000)
    }
    else
      setTimeout(()=> {
        if (chosen_class.classList === undefined) return
        chosen_class.classList.replace('task_element_input_error','hidden_task_element_input_error')
      }, 0)
    // let x = document.getElementsByClassName('task_elm');
    // debugger;
    // let y = document.getElementsByClassName('hidden_task_element_input_error')
    // for (let i=0; i<y.length; i++) {
    //   y[i].className = 'task_element_input_error';
    // }
    // let x = e.target.parentNode.childNodes[0].childNodes[2].className = 'task_element_input_error';
    // e.target.childNodes[1].className = 'task_element_input_error'
    // if (e.target !== undefined)
    //   e.target.parentNode.childNodes[2].classList.replace('hidden_task_element_input_error', 'task_element_input_error')
    // else
    //   e.childNodes[2].classList.replace('hidden_input_error', 'input_error')
  }

  const addTask = (index, values, add=false) => {
    if (values == null) {
      values = {'user_id':props.userID,'task_title':'', 'duration':'30','priority':'0', 'recurrings':'1', 'category_id':'-1','constraints':'000000000000000000000', 'pinned_slot':null}
    }
    if (values['constraints'] === '111111111111111111111')
      values['constraints'] = '000000000000000000000'
    let constraints_params = getConstraints(index, values['constraints']);
    let i = index
    let trash_bin = <svg className='bin_icon' id={'trash_bin'+index} onClick={(e) => bin_task(e,index)}  key={'trash_bin'+index} height="30px" viewBox="-40 0 427 427.00131" width="30px" xmlns="http://www.w3.org/2000/svg"><path d="m232.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"/><path d="m114.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"/><path d="m28.398438 127.121094v246.378906c0 14.5625 5.339843 28.238281 14.667968 38.050781 9.285156 9.839844 22.207032 15.425781 35.730469 15.449219h189.203125c13.527344-.023438 26.449219-5.609375 35.730469-15.449219 9.328125-9.8125 14.667969-23.488281 14.667969-38.050781v-246.378906c18.542968-4.921875 30.558593-22.835938 28.078124-41.863282-2.484374-19.023437-18.691406-33.253906-37.878906-33.257812h-51.199218v-12.5c.058593-10.511719-4.097657-20.605469-11.539063-28.03125-7.441406-7.421875-17.550781-11.5546875-28.0625-11.46875h-88.796875c-10.511719-.0859375-20.621094 4.046875-28.0625 11.46875-7.441406 7.425781-11.597656 17.519531-11.539062 28.03125v12.5h-51.199219c-19.1875.003906-35.394531 14.234375-37.878907 33.257812-2.480468 19.027344 9.535157 36.941407 28.078126 41.863282zm239.601562 279.878906h-189.203125c-17.097656 0-30.398437-14.6875-30.398437-33.5v-245.5h250v245.5c0 18.8125-13.300782 33.5-30.398438 33.5zm-158.601562-367.5c-.066407-5.207031 1.980468-10.21875 5.675781-13.894531 3.691406-3.675781 8.714843-5.695313 13.925781-5.605469h88.796875c5.210937-.089844 10.234375 1.929688 13.925781 5.605469 3.695313 3.671875 5.742188 8.6875 5.675782 13.894531v12.5h-128zm-71.199219 32.5h270.398437c9.941406 0 18 8.058594 18 18s-8.058594 18-18 18h-270.398437c-9.941407 0-18-8.058594-18-18s8.058593-18 18-18zm0 0"/><path d="m173.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"/></svg>
    let thumbtack = <div onMouseOver={(e)=>showInputError(e, true)} onMouseLeave={(e)=>showInputError(e, false)}><div onMouseOver={(e) => slotToTime(values['pinned_slot'], e)} onClick={(e)=>showPinnedCalendar(e,i)} className={values['pinned_slot']?'col-1 thumbtack_done':'col-1 thumbtack'} id={'thumbtack'+index}/>    <div id={'pinned_error_message'} className={'hidden_task_element_input_error'}>Cannot pin past dates.</div></div>;
    // let pinned_calendar = <DatePicker shouldCloseOnSelect={false} selected={startDate} onChange={(e,date) => handleChange(['pinned_slot',date,e], i)} name='pinned_slot' dateFormat="dd/MM/yyyy h:mm aa" showTimeInput calendarContainer={calendarContainer} id={'pinned_calendar'+index} key={'pinned_calendar'+index} customInput={thumbtack}/>;
    // let pinned_calendar = <div onChange={console.log('changed1')} id={'pinned_calendar'+index} key={'pinned_calendar'+index} className='pinned_calendar' ><Datetime onChange={console.log('changed2')} closeOnClickOutside={true} input={false} isValidDate={checkValidity}/></div>;
    let pinned_calendar = <span key={'pinned_calendar'+index} className='pinned_calendar' id={'pinned_calendar'+index}>
      <select key={'pinned_choose_day'+index} onChange={(e) => handleChange(e, i)} defaultValue={getDay(values['pinned_slot'], i)} className='pinned_choose_day' name="pinned_choose_day" id={"pinned_choose_day"+index}>
        <option value="">Day</option>
        <option value="0">Sunday</option>
        <option value="1">Monday</option>
        <option value="2">Tuesday</option>
        <option value="3">Wednesday</option>
        <option value="4">Thursday</option>
        <option value="5">Friday</option>
        <option value="6">Saturday</option>
    </select>
    <input onChange={(e) => handleChange(e, i)} name="pinned_choose_time" defaultValue={getTime(values['pinned_slot'])} key={'pinned_choose_time'+index} id={'pinned_choose_time'+index} className='pinned_choose_time' type="time"/>
    </span>;
    let hebrew = (/[\u0590-\u05FF]/).test(values['task_title'])
    let heb_class = ''
    if (hebrew)
      heb_class = 'heb_class_title '
    let task_title = <span onMouseOver={(e)=>showInputError(e, true)} onMouseLeave={(e)=>showInputError(e, false)} key={'task_title'+index} id={'task_title'+index} className=' col-sm-3' onChange={(e) => handleChange(e, i)}><span className= 'task_elm'>Title:&nbsp;</span><input id={'title_textbox'+index} className={'title_input'} name='task_title' type='text' defaultValue={values['task_title']}/><div id={'title_error_message'} className={'hidden_task_element_input_error'}>Title is too long.</div></span>
    let recurrence = <div onMouseOver={(e)=>showInputError(e, true)} onMouseLeave={(e)=>showInputError(e, false)}><input key={'recurrence'+index} id={'recurrings'+index} name='recurrings' onClick={(e)=> {
      if (document.getElementById('thumbtack'+index).className !== 'thumbtack_done') {
        handleChange(e, i);
        unpinTask(e, i);
        recurrenceIconChange(e, i);
      }
    }} onChange={(e) => handleChange(e, i)} className={'recurrence recurrence'+values['recurrings']}/><div id={'recurrence_error_message'} className={'hidden_task_element_input_error'}>Too many recurrences.</div>
    </div>;
    let rec_pin = <div className={'row rec_pin'}>{recurrence}{thumbtack}</div>
    let title_and_thumbtack = <span key={'title_and_thumbtack'+index} className='row justify-content-between'>{task_title}{rec_pin}</span>;
    let duration = <div onMouseOver={(e)=>showInputError(e, true)} onMouseLeave={(e)=>showInputError(e, false)} key={'duration'+index} id={'duration'+index} className='row ttt '><div className={'task_elm'}>Duration:</div>
      <div className={'first_row'}>
        <div id='duration_options_arrow'/>&nbsp;
        <select key={'duration_options'+index} size='1' id={'duration_options'+index} className={getDuration(values['duration']) === 'null'?'duration_options_hidden':'duration_options'} name='duration' defaultValue={getDuration(values['duration'])} onChange={(e) => handleChange(e, i)}>
          <option value="0.5">0.5</option>
          <option value="1">1</option>
          <option value="1.5">1.5</option>
          <option value="2">2</option>
          <option value="2.5">2.5</option>
          <option value="3">3</option>
          <option value="null">More</option>
        </select>
        <input placeholder='___' maxLength={3} id={'input_duration'+i} className={getDuration(values['duration']) === 'null'?'input_duration':'input_duration_hidden'} name='duration' type='text' defaultValue={getDuration(values['duration']) === 'null'?values['duration']/60:''} onChange={(e) => handleChange(e, i)}/>
      </div>
      <div>hours</div>
      <div id={'duration_error_message'} className={'hidden_task_element_input_error'}>Duration is too long.</div>
    </div>;
    let priority = <div key={'priority'+index} id={'priority'+index} className='priority_elm'><span className='task_elm'>Priority:</span>
      <div className='wrapper_options'><div id='priority_options_arrow'/>&nbsp;</div>
      <select key={'priority_options'+index} id={'priority_options'+index} className={'priority_options'} name='priority' defaultValue={values['priority']} onChange={(e) => handleChange(e, i)}>
        <option value="0">None</option>
        <option value="1">Low</option>
        <option value="2">Medium</option>
        <option value="3">High</option>
      </select></div>;
    // let category_id = <div key={'category_id'+index} className='task_elm' onChange={(e) => handleChange(e, i)}>Category:&nbsp;<input name='category_id' type='text' defaultValue={values['category_id']}/></div>;
    let options = [<option key={'opt'+-1} value={-1}>{'None'}</option>];
    for (let j=0; j<props.categories.length; j++) {
      if (props.categories[j]['category_name'] !== '')
        options.push(<option id={'option_'+j+'_'+index} key={'option_'+j+'_'+index} value={j}>{props.categories[j]['category_name']}</option>)
      else
        options.push(<option id={'option_'+j+'_'+index} key={'option_'+j+'_'+index} value={j} style={{display:'none'}}/>)
    }
    let category_id = <div onMouseOver={(e)=>showInputError(e, true)} onMouseLeave={(e)=>showInputError(e, false)} key={'category_id'+index} id={'category_id'+index} className={'cat_elm'} onChange={(e) => handleChange(e, i)}><span className='task_elm' >Category:&nbsp;</span>
      <div className='wrapper_options'><div id='category_options_arrow'/>&nbsp;</div>
      <select key={'category_options'+index}  className='category_options' name='category_id' defaultValue={values['category_id']} onChange={(e) => handleChange(e, i)}>
        {options}
      </select>
      <div id={'category_error_message'} className={'hidden_task_element_input_error'}>No slots available for<br/>chosen category..</div>
    </div>;
    let constraints = <div onMouseOver={(e)=>showInputError(e, true)} onMouseLeave={(e)=>showInputError(e, false)} key={'constraints'+index} id={'constraints'+index}  onChange={(e) => handleChange(e, i)}><div className='task_elm'>Day of Week:&nbsp;</div><div className={'constraints_element'} >{constraints_params}</div><div id={'daysofweek_error_message'} className={'hidden_task_element_input_error'}>Cannot schedule chosen<br/>days of week.</div></div>;
    let task = <div key={'task'+index} id={'task'+index} className='closed_task'>{[pinned_calendar, title_and_thumbtack, duration, priority, category_id, constraints]}</div>
    let sign = <div id={'expand_icon'+index} className={'expand_icon'} onClick={(e) =>  expandTask(e, task, index)} key='plus_sign'/>
    let pastDue = <div key={'pastDue'+index} id={'pastDue_'+index} className={'past_due_hidden'}>
      <span className={'dont_reschedule'} onClick={(e) => bin_task(e,index, true)}/>
      Reschedule?
      <span className={'reschedule'} onClick={(e) => {
        removeFromPastDue(e, i);
        handleChange(e, i)
        handlePastDue(e, i);
      }}/>
    </div>
    let animation = '';
    if (add || jsxRef.current.size === 0) {
      animation = ' task_appear'
    }
    let task_container = <div style={{zIndex:100000-index}} key={'task_container'+index} id={'task_container'+index} className={'task_container'+animation} >{[sign, pastDue, task,trash_bin]}</div>
    containerRef.current = task_container
    if (add === true)
      setTasksJsx(prevArr => [...prevArr,task_container])
    setTaskNumber(task_number+1)
    return task_container;
  }

  const removeFromPastDue = (e, i) => {
    const copyPastDue = {...pastDueRef.current}
    delete copyPastDue[i]
    setPastDue(copyPastDue)
  }

  const handlePastDue = (event, i) => {
    let parent = document.getElementById('pastDue_'+i)
    parent.className = 'past_due_hidden'
    // event.target.parentNode.style.display = 'none'
  }

  const showDaytimes = (e, index) => {
    let days_dct = {'Su':0, 'M':1, 'T':2, 'W':3, 'Th':4, 'F':5, 'S':6};
    let day = e.target.innerHTML;
    let morning = document.getElementById('morning_label_'+e.target.innerText+index)
    let morning_input = document.getElementById('morning_'+e.target.innerText+index)
    let noon = document.getElementById('noon_label_'+e.target.innerText+index)
    let noon_input = document.getElementById('noon_'+e.target.innerText+index)
    let evening = document.getElementById('evening_label_'+e.target.innerText+index)
    let evening_input = document.getElementById('evening_'+e.target.innerText+index)
    let hidden = '_hidden'
    let not_hidden = ''
    let temp_arr = daysRef.current
    // If all clicked, unmark all and reduce value by 3.
    if (morning.className.includes('clicked') && noon.className.includes('clicked') &&
        evening.className.includes('clicked')){
      temp_arr[index] -= 3
      morning_input.click()
      noon_input.click()
      document.getElementById('evening_'+e.target.innerText+index).click()
      // If none are visible, show them and add by 3.
    } else {
      if (!morning.className.includes('clicked')) {
        morning_input.click()
        temp_arr[index] += 1
      }
      if (!noon.className.includes('clicked')) {
        noon_input.click()
        temp_arr[index] += 1
      }
      if (!evening.className.includes('clicked')) {
        evening_input.click()
        temp_arr[index] += 1
      }
    }
    if (!morning.className.includes('clicked') && !noon.className.includes('clicked') &&
        !evening.className.includes('clicked')) {
      morning.className = 'row morning_icon'
      noon.className = 'row noon_icon'
      evening.className = 'row evening_icon'
    }
    setChosenDays(temp_arr)
    // console.log('kuskus ', morning.className)
    // console.log('kuskus ', noon.className)
    // console.log('kuskus ', evening.className)
    if (morning.className.endsWith('morning_icon') || noon.className.endsWith('noon_icon') || evening.className.endsWith('evening_icon')){
      hidden = ''
      not_hidden = '_hidden'
      morning.className = 'row morning_icon_clicked'
      noon.className = 'row noon_icon_clicked'
      evening.className = 'row evening_icon_clicked'
    } else if (morning.className.endsWith('clicked') & noon.className.endsWith('clicked') && evening.className.endsWith('clicked')){
      morning.className = 'row morning_icon'
      noon.className = 'row noon_icon'
      evening.className = 'row evening_icon'
    }
    let task_container = document.getElementById('task'+index)
    let error = task_container.className.split('_').slice(-1)[0] === 'error'?'_error':''
    if (daysRef.current[index] === 0) {
      task_container.className = 'expanded_task' + error
    } else {
      task_container.className = 'expanded_task_daytime'+error
    }
    // console.log('XXXXXXXXXXX ', daysRef.current[index] === 0)
  }

  const changeDayTimeIcon = (e, index) =>  {
    console.log('change day ', e.target.className.includes('noon'))
    let temp_arr = daysRef.current
    let clicked = '_clicked'
    let no_click = ''
    if (e.target.className.includes('clicked')) {
      clicked = ''
      no_click = '_clicked'
    }
    if (e.target.className.includes('morning')) {
      e.target.classList.remove('morning_icon'+no_click)
      e.target.classList.add('morning_icon'+clicked)
    } else if (e.target.className.includes('noon')) {
      e.target.classList.remove('noon_icon'+no_click)
      e.target.classList.add('noon_icon'+clicked)
    } else if (e.target.className.includes('evening')){
      e.target.classList.remove('evening_icon'+no_click)
      e.target.classList.add('evening_icon'+clicked)
    }
    if (clicked === '')
      temp_arr[index] -= 1
    else
      temp_arr[index] += 1
    setChosenDays(temp_arr)
  }

  const getConstraints = (index, values) => {
    let i;
    let int_values = []
    let days = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];
    for (i=0;i<values.length;i++)
      int_values.push(parseInt(values[i]))
    let constraints = [];
    let temp_chosen_days = 0
    for (i=0;i<7;i++) {
      // let hidden = '_hidden';
      let hidden = '';
      let clicked1 = '', clicked2 = '', clicked3 = '';
      let morning_val = parseInt(int_values[3*i])
      let noon_val = parseInt(int_values[3*i+1])
      let evening_val = parseInt(int_values[3*i+2])
      temp_chosen_days += morning_val+noon_val+evening_val
      if (int_values[3*i] === 1 || int_values[3*i+1] === 1 || int_values[3*i+2] === 1) {
        hidden = ''
        if (int_values[3*i] === 1) clicked1 = '_clicked'
        if (int_values[3*i+1] === 1) clicked2 = '_clicked'
        if (int_values[3*i+2] === 1) clicked3 = '_clicked'
      }
      constraints.push(
          <div className='spacing_days' key={days[i]+index}>
            <div onClick={(e)=>showDaytimes(e, index)} className='row day_of_week'>
              {days[i]}
            </div>
            <div id={'daytime_icons'+index} className='daytime_icons'>
              <input type="checkbox" className='days_checkbox' key={'morning_'+days[i]+index} id={'morning_'+days[i]+index} name="constraints" value={3*i} defaultChecked={int_values[3*i]}/>
              <label onClick={(e)=>changeDayTimeIcon(e, index)} className={'row morning_icon' + hidden + clicked1} id={'morning_label_'+days[i]+index} htmlFor={'morning_'+days[i]+index}/>
              <input type="checkbox" className='days_checkbox' key={'noon_'+days[i]+index} id={'noon_'+days[i]+index} name="constraints" value={3*i+1} defaultChecked={int_values[3*i+1]}/>
              <label onClick={(e)=>changeDayTimeIcon(e, index)} className={'row noon_icon'+hidden+clicked2} id={'noon_label_'+days[i]+index} htmlFor={'noon_'+days[i]+index}/>
              <input className='days_checkbox' type="checkbox" key={'evening_'+days[i]+index} id={'evening_'+days[i]+index} name="constraints" value={3*i+2} defaultChecked={int_values[3*i+2]} />
              <label onClick={(e)=>changeDayTimeIcon(e, index)} className={'row evening_icon'+hidden+clicked3} id={'evening_label_'+days[i]+index} htmlFor={'evening_'+days[i]+index}/>
            </div>
          </div>);
    }
    let temp_arr = daysRef.current
    temp_arr[index] = temp_chosen_days
    setChosenDays(temp_arr)
    // console.log('CONSTRAINTS: ', temp_chosen_days)
    return <div id='test1' className='row'>{constraints}</div>;
  }

  const dueDateAnimation = [[
    { 'opacity': 0, transform: 'translateY(50px)', zIndex:'0'},
    { 'opacity': 1, transform: 'translateY(-70px)', visibility:'visible', zIndex:'1000100'}
  ], {duration: 500, fill: 'forwards', easing: 'ease-out'}];
  const endDueDateAnimation = [[
    { 'opacity': 1, transform: 'translateY(-70px))', zIndex:'1000100'},
    { 'opacity': 0, transform: 'translateY(50px)', visibility:'hidden', zIndex:'0'}
  ], { duration: 500, fill: 'forwards', easing: 'ease-in'}];

  // Checks inputs, returns true if should not sent, false to send. //TODO maybe swap bools?
  const checkInputs = () => {
    // Do not send anything if no change has occurred in to-do list.
    if (Object.keys(props.updated_tasks).length === 0 && removed_tasks.length === 0 && !props.categoryChanged) return true
    let date = new Date()
    let todays_slot = props.scheduleMoment
    let total_err = false
    let pastDueErr = false
    // Go through all jsx elements.
    for (let i=0; i<jsxRef.current.length; i++) {
      let task_err = false
      let task_index = jsxRef.current[i].props['id'].split('task_container')[1]
      console.log('past due ', pastDueRef.current)
      console.log('past due ', pastDue)
      let past_due = document.getElementById('pastDue_' + task_index)
      // Check if task is past due.
      if (task_index in pastDueRef.current) {
        past_due.className = 'past_due'
        pastDueErr = true
      }
      // If current task wasn't updated, no need to check its input.
      if (!(task_index in props.updated_tasks)) continue
      // Check title length.
      // let temp_task = document.getElementById('title_textbox' + task_index)
      let title_item = document.getElementById('task_title' + task_index)
      // If title is too long
      if (props.updated_tasks[task_index]['task_title'].length > 30) {
        // temp_task.classList.add('task_error')
        title_item.classList.add('task_error')
        task_err = true
        total_err = true
      } else {
        // temp_task.classList.remove('task_error')
        title_item.classList.remove('task_error')
      }
      // Check duration length.
      let duration = document.getElementById('duration' + task_index)
      // If duration is more than 7 hours
      if (props.updated_tasks[task_index]['duration'] > 7*60) {
        duration.classList.add('task_error')
        task_err = true
        total_err = true
      } else {
        duration.classList.remove('task_error')
      }
      // Check if pinned to a future date.
      let pinned_task = document.getElementById('thumbtack' + task_index)
      let pinned_slot = props.updated_tasks[task_index]['pinned_slot']
      // console.log('HELLO, ', props.updated_tasks[task_index]['pinned_slot'], todays_slot, pinned_slot !== null)
      if (pinned_slot !== null && pinned_slot < todays_slot) {
        pinned_task.classList.add('thumbtack_error')
        task_err = true
        total_err = true
      } else {
        pinned_task.classList.remove('thumbtack_error')
      }
      // Present error.
      let container = document.getElementById('task' + task_index)
      let expansion_button = document.getElementById('expand_icon' + task_index)
      console.log('task error: ',task_err)
      if (task_err){
        container.classList.replace('expanded_task', 'closed_task_error')
        container.classList.replace('expanded_task_daytime', 'closed_task_error')
        // container.classList.replace('closed_task', 'closed_task_error')
        expansion_button.className = 'expand_icon'
      } else {
        container.classList.replace('expanded_task_error', 'expanded_task')
        container.classList.replace('closed_task_error', 'closed_task')
        container.classList.replace('expanded_task_daytime_error', 'expanded_task_daytime')
      }
    }

    if (total_err) {
      let popup = document.getElementById('error_popup')
      popup.animate(props.errorAnimation[0], props.errorAnimation[1])
      setTimeout(function() {
        popup.animate(props.endErrorAnimation[0], props.endErrorAnimation[1])
      }, 3000)
    }

    if (pastDueErr) {
      let start_animation = [props.errorAnimation[0], props.errorAnimation[1]]
      let end_animation = [props.endErrorAnimation[0], props.endErrorAnimation[1]]
      if (total_err){
        start_animation = [dueDateAnimation[0], dueDateAnimation[1]]
        end_animation = [endDueDateAnimation[0], endDueDateAnimation[1]]
      }
      let pastDuePopup = document.getElementById('due_date_popup')
      pastDuePopup.animate(start_animation[0], start_animation[1])
      setTimeout(function() {
        pastDuePopup.animate(end_animation[0], end_animation[1])
      }, 3000)
    }
    return total_err || pastDueErr
  }

  const onSubmitHandler = (event) => {
    // let task_height = document.getElementsByClassName('task_container')[0].getBoundingClientRect().height
    // document.getElementById('container').scrollTo({top:(task_height) * 1, behavior:'smooth' })
    // document.getElementsByClassName('closed_task')[1].className = 'closed_task_hover'
    event.preventDefault();
    if (checkInputs()) return
    props.setIsLoaded(false)
    sendTasksToRemove();
    sendTasksToPost();
    props.setTasks({})
    // props.getTasks()
    props.setUpdatedTasks({})
    setRemovedTasks([])
    setTodoIDs({})
    // setTasksJsx(new Set())
    props.setToOptimize(true)
    props.handleCategoriesSubmission()

    // props.setCategoryTrigger(true)

    // Prevent duplicates after submitting, when user has no tasks prior to submitting new tasks.
    // if (tasks.length === 0) setIsLoaded(true)
    //Reloading page to reload updates jsx.
    // window.location.reload();
  };

  useEffect(() => {
  },[props.isLoaded])

  const sendTasksToRemove = () => {
    fetch('http://localhost:5000/tasks/DeleteTasks/'+props.userID, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(removed_tasks)
    })
        .then((response) => {
          if (response.status === 200) {
            //console.log("User's tasks hes been removed successfully.");
          } else {
            //console.log("Request status code: " + response.status);
          }
          //console.log('promise of remove: ',response.text())
        })
        .catch((error) => {
          console.error("Error while submitting task: " + error.message);
        });
  }

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }
    props.trigTasks()
    props.getTasks()
  }, [trigger])

  const sendTasksToPost = () => {
    console.log('updated tasks: ', props.updated_tasks)
    let s = 'temp_task_id'
    // Update recurrence counter to 1 if task is pinned, and remove temporary task ID.
    for (const key of Object.keys(props.updated_tasks)){
      if (props.updated_tasks[key]['pinned_slot'] !== null)
        props.updated_tasks[key]['recurrings'] = 1
      if (!(props.updated_tasks[key][s] in tasks)) {
        delete props.updated_tasks[key][s]
      } else {
        props.updated_tasks[key]['task_id'] = props.updated_tasks[key][s]
        delete props.updated_tasks[key][s]
      }
    }
    let example = [{"category_id": "-1",
      "constraints": "000000010000011000000",
      "duration": "30",
      "pinned_slot": null,
      "priority": "0",
      "recurrings": "1",
      "task_title": "trythis",
      "user_id": "193"}]
    ////debugger
    console.log('updated tasks(before post)2: ', Object.values(props.updated_tasks))
    fetch('http://localhost:5000/tasks/UpdateTasks/{tasks}', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.values(props.updated_tasks))
    })
        .then((response) => {
          setTrigger(!trigger)
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

  useEffect(() => {
    console.log('updated tasks: ', props.updated_tasks)
  }, [props.updated_tasks])

  const handlePinned = (index) => {
    let days_dct = {0:  'Sunday', 1:'Monday', 2:'Tuesday', 3:'Wednesday', 4:'Thursday', 5:'Friday', 6:'Saturday'}
    let day = document.getElementById('pinned_choose_day'+index).value;
    let time = document.getElementById('pinned_choose_time'+index).value;
    let pin = document.getElementById('thumbtack'+index);
    let calendar = document.getElementById('pinned_calendar'+index);
    if (day === '') {
      // if (pin.classList.contains('thumbtack_clicked') === false)
      //   pin.className = 'thumbtack_clicked';
      return null;
    }
    else if (time !== '') {
      pin.className = 'thumbtack_done';
      // If pinned, reset value of recurrence (cannot happen simultaneously).
      document.getElementById('recurrings'+index).className = 'recurrence recurrence1'
      // handleChange(e, i);
      let nam = 'pinned_slot';
      pin.title = days_dct[day] + ', ' + time;
      let val = props.timeToSlot(day, time);
      return [nam, val];
    } else return null;
  }

  const handleChange = (event, index) => {
    // If handling pinned slot, we should get event, and not its target (due to its API's implementation).
    let nam;
    let val;
    let split_i = 0;
    nam = event.target.name;
    val = event.target.value;
    console.log('val: ', val)
    console.log('nam: ', nam)
    // Handling constraints
    if (nam === 'constraints') {
      handleConstraints(event, index)
      return;
    }
    // Handling pinned.
    if (nam === 'pinned_choose_day' || nam === 'pinned_choose_time') {
      let pinned = handlePinned(index);
      if (!pinned) return;
      nam = pinned[0]
      val = pinned[1]
    }
    // convert duration to minutes.
    if (nam === 'duration') {
      let input_text = event.target.parentNode.childNodes[event.target.parentNode.childNodes.length-1]
      // If pressed manual input option.
      if (val === 'null') {
        event.target.className = 'duration_options_hidden'
        input_text.className = 'input_duration'
        return
        // If not editing duration manual input
      } else if (event.target.className !== 'input_duration') {
        input_text.value = ''
        event.target.className = 'duration_options'
        input_text.className = 'input_duration_hidden'
      }
      val *= 60;
    }
    else if (nam === 'recurrings') {
      let current_value = parseInt(event.target.className.slice(-1)[0])
      if (current_value === 7) current_value = 0;
      val = current_value + 1;
    } else if (nam === 'category_id') {
      // //////debugger
    }
    let empty_task = {'temp_task_id':index,'user_id':props.userID,'task_title':'', 'duration':'30','priority':'0', 'recurrings':'1', 'category_id':'-1','constraints':'000000000000000000000', 'pinned_slot':null};
    let updated = updatedRef.current
    // If task is new, create a new instance of it, else edit existing/
    //removes old task when submitting form.
    if (typeof (updated[index]) ==='undefined') {
      if (typeof (tasks[index]) ==='undefined') {
        updated[index] = {...empty_task, [nam]: val}
      } else {
        update_task(index)
        let task_copy = Object.assign({}, tasks[index])
        delete task_copy['task_id']
        task_copy['temp_task_id'] = index
        updated[index] = {...task_copy, [nam]: val}
      }
    } else {
      updated[index][nam] = val
    }
    console.log('val: ',val)
    console.log('updated: ', updated)
    props.setUpdatedTasks(updated)
  }

  const handleConstraints = (event, index) => {
    console.log('THE EVENT0: ', event)
    let task_container = document.getElementById('task'+index)
    let error = task_container.className.split('_').slice(-1)[0] === 'error'?'_error':''
    let nam, val, checked_num;
    if (event.target !== undefined) {
      console.log('THE EVENT: ', event.target.checked)
      nam = event.target.name;
      val = parseInt(event.target.value);
      checked_num = 0;
      if (event.target.checked)
        checked_num = 1;
    } else {
      console.log('THE EVENT2: ', event.checked)
      nam = event.name;
      val = parseInt(event.value);
      checked_num = 0;
      if (event.checked)
        checked_num = 1;
    }
    //console.log('nam: ',nam)
    //console.log('val: ',val)
    // //console.log('print: ', '1'.repeat(val) + '0' + '1'.repeat(20-val))
    let empty_task = {'temp_task_id':index,'user_id':props.userID,'task_title':'', 'duration':'30','priority':'0', 'recurrings':'1', 'category_id':'-1','constraints':'000000000000000000000', 'pinned_slot':null};
    let updated = updatedRef.current
    // If task is new, create a new instance of it, else edit existing/
    //removes old task when submitting form.
    if (typeof (updated[index]) ==='undefined') {
      console.log('1')
      if (typeof (tasks[index]) ==='undefined') {
        console.log('2')
        empty_task['constraints'] = empty_task['constraints'].substring(0,val) + checked_num + empty_task['constraints'].substring(val+1)
        updated[index] = empty_task
        console.log('3 ',empty_task['constraints'].substring(0,val) + checked_num + empty_task['constraints'].substring(val+1))

      } else {
        update_task(index)
        let task_copy = Object.assign({}, tasks[index])
        delete task_copy['task_id']
        task_copy['temp_task_id'] = index
        task_copy['constraints'] = task_copy['constraints'].substring(0,val) + checked_num + task_copy['constraints'].substring(val+1)
        updated[index] = task_copy
        console.log('3 ',task_copy['constraints'].substring(0,val) + checked_num + task_copy['constraints'].substring(val+1))
      }
    } else {
      console.log('4 ', updated[index]['constraints'].substring(0,val) + checked_num + updated[index]['constraints'].substring(val+1))
      // //console.log('the val: ', updated)
      updated[index][nam] = updated[index]['constraints'].substring(0,val) + checked_num + updated[index]['constraints'].substring(val+1)
    }
    if (daysRef.current[index] === 0) {
      task_container.className = 'expanded_task' + error
    } else {
      task_container.className = 'expanded_task_daytime'+error
    }
    props.setUpdatedTasks(updated)
  }

  const update_task = (i) => {
    if (!(Object.values(removedRef.current).includes(tasks[i]['task_id']))) {
      setRemovedTasks(prev => [...prev, tasks[i].task_id])
    }
  }

  return (
      <div id='todo_parent_component'>
        <header className="App-header">
          <div id='header'>My To-Do List</div>
          <form id='container' onSubmit={onSubmitHandler}>
            <div id='tasks'>{tasks_jsx}</div>
            <div id='empty_todo'/>
            <div id='loading_todo'/>
          </form><br/>
          <div id={'bottom_content'}>
            <div id='add_a_new_task' onClick={() => {
              addTask(task_number,null, true)
            }}/>
            <input id='submit_button' value='Send' className="btn btn-primary btn-md" type='submit' form='container'/>
          </div>
          <div id='due_date_popup'>Please handle past due tasks.</div>
          <div id='error_popup'>Could not generate schedule.</div>
        </header>
      </div>
  );

}

export default Todo;
