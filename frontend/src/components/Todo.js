import './Todo.css';
import React, {useState, useEffect, useRef} from 'react';
import Menu from "./Menu";

const Todo = (props) => {
  const [tasks_jsx, setTasksJsx] = useState([])
  const [tasks, setTasks] = useState([])
  const [removed_tasks, setRemovedTasks] = useState([])
  const [updated_tasks, setUpdatedTasks] = useState({})
  const [task_number, setTaskNumber] = useState(1)
  const [isLoaded, setIsLoaded] = useState(false)
  const firstUpdate = useRef(true)
  const firstUpdate2 = useRef(true)
  const jsxRef = useRef();
  jsxRef.current = tasks_jsx;
  const containerRef = useRef();
  const tasksRef = useRef();
  tasksRef.current = tasks
  const numRef = useRef()
  numRef.current = task_number

  //Adding JSX
  useEffect(() => {
    props.getTasks()
  }, []);


  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }
    setTasks(props.updating_tasks)
  }, [props.updating_tasks])

  useEffect(() => {
    if (firstUpdate2.current) {
      firstUpdate2.current = false
      return
    }
    if (!isLoaded) {
      setIsLoaded(!isLoaded)
      let i = 0;
      if (tasks.length > 0) {
        for (i = 0; i < tasks.length; i++) {
          addTask(i + 1, tasks[i])
        }
      }
      // TODO - put it at the bottom. When loading tasks it will always be the bottom task container.
      // addTask(i+1)
      setTaskNumber(i+2)
    }
  }, [tasks])

  useEffect(() => {
    console.log('JSX HAS CHANGED! it is now: ', tasks_jsx)
  },[tasks_jsx])

  const bin_task = (event,i) => {
    //if (i > tasks.length && !(i in updated_tasks)) return //TODO - add a message - 'cannot remove empty task'.
    setTasksJsx(jsxRef.current.filter(item => item.props.id !== 'task_container' + i))
    for (let [key, value] of Object.entries(updated_tasks)) {
      if (value['temp_task_id'] === i) {
        let clone = updated_tasks;
        delete clone[key]
        setUpdatedTasks(clone)
      }
    }
    // TODO - remove task from tasks if exists.
    if (tasksRef.current[i - 1] !== undefined) {
      setRemovedTasks(prevArr => [...prevArr, tasksRef.current[i - 1].task_id])
    }
  }

  const expandTask = (event, task) => {
    let clicked_task = document.getElementById(task.props.id)
    if (event.target.id === 'expand_icon') {
      event.target.id = 'minus_icon'
      clicked_task.className = 'expanded_task'
    }
    else {
      event.target.id = 'expand_icon'
      clicked_task.className = 'closed_task'
    }
  }

  const addTask = (index, values) => {
    if (values == null) {
      values = {'user_id':'','task_title':'', 'duration':'','priority':'','category_id':'','constraints':''}
    }
    let i = index
    //TODO - resolve a bug: after opening a task and adding a new one, it is created as duplicate(container id)
    let trash_bin = <svg className='bin_icon' id={'trash_bin'+index} onClick={(e) => bin_task(e,index)}  key={'trash_bin'+index} height="30px" viewBox="-40 0 427 427.00131" width="30px" xmlns="http://www.w3.org/2000/svg"><path d="m232.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"/><path d="m114.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"/><path d="m28.398438 127.121094v246.378906c0 14.5625 5.339843 28.238281 14.667968 38.050781 9.285156 9.839844 22.207032 15.425781 35.730469 15.449219h189.203125c13.527344-.023438 26.449219-5.609375 35.730469-15.449219 9.328125-9.8125 14.667969-23.488281 14.667969-38.050781v-246.378906c18.542968-4.921875 30.558593-22.835938 28.078124-41.863282-2.484374-19.023437-18.691406-33.253906-37.878906-33.257812h-51.199218v-12.5c.058593-10.511719-4.097657-20.605469-11.539063-28.03125-7.441406-7.421875-17.550781-11.5546875-28.0625-11.46875h-88.796875c-10.511719-.0859375-20.621094 4.046875-28.0625 11.46875-7.441406 7.425781-11.597656 17.519531-11.539062 28.03125v12.5h-51.199219c-19.1875.003906-35.394531 14.234375-37.878907 33.257812-2.480468 19.027344 9.535157 36.941407 28.078126 41.863282zm239.601562 279.878906h-189.203125c-17.097656 0-30.398437-14.6875-30.398437-33.5v-245.5h250v245.5c0 18.8125-13.300782 33.5-30.398438 33.5zm-158.601562-367.5c-.066407-5.207031 1.980468-10.21875 5.675781-13.894531 3.691406-3.675781 8.714843-5.695313 13.925781-5.605469h88.796875c5.210937-.089844 10.234375 1.929688 13.925781 5.605469 3.695313 3.671875 5.742188 8.6875 5.675782 13.894531v12.5h-128zm-71.199219 32.5h270.398437c9.941406 0 18 8.058594 18 18s-8.058594 18-18 18h-270.398437c-9.941407 0-18-8.058594-18-18s8.058593-18 18-18zm0 0"/><path d="m173.398438 154.703125c-5.523438 0-10 4.476563-10 10v189c0 5.519531 4.476562 10 10 10 5.523437 0 10-4.480469 10-10v-189c0-5.523437-4.476563-10-10-10zm0 0"/></svg>
    let task_title = <span key={'task_title'+index} id='task_elm' onChange={(e) => handleChange(e, i)}> <input id='title_textbox' name='task_title' type='text' defaultValue={values['task_title']}/></span>
    let duration = <div key={'duration'+index} id='task_elm' onChange={(e) => handleChange(e, i)}> Duration:&nbsp;&nbsp;<input id={'nums_input'+i} name='duration' type='text' defaultValue={values['duration']}/></div>;
    let priority = <div key={'priority'+index} id='task_elm' onChange={(e) => handleChange(e, i)}>Priority:&nbsp;&nbsp;
      <select id='priority_options' name='priority' defaultValue={values['priority']} onChange={handleChange}>
        <option value="0">None</option>
        <option value="1">Low</option>
        <option value="2">Medium</option>
        <option value="3">High</option>
      </select></div>;
    let category_id = <div key={'category_id'+index} id='task_elm' onChange={(e) => handleChange(e, i)}>Category:&nbsp;&nbsp;<input name='category_id' type='text' defaultValue={values['category_id']}/></div>;
    let constraints = <div key={'constraints'+index} id='task_elm' onChange={(e) => handleChange(e, i)}>Constraints:&nbsp;&nbsp;<input name='constraints' type='text' defaultValue={values['constraints']}/></div>;
    let task = <div key={'task'+index} id={'task'+index} className='closed_task'>{[task_title, duration, priority, category_id, constraints]}</div>
    let sign = <div id='expand_icon' onClick={(e) =>  expandTask(e, task)} key='plus_sign'/>
    let task_container = <div key={'task_container'+index} id={'task_container'+index} className='task_container' >{[sign, task,trash_bin]}</div>
    containerRef.current = task_container
    setTasksJsx(prevArr => [...prevArr,task_container])
    setTaskNumber(task_number+1)
  }

  const onSubmitHandler = (event) => {
    console.log('submit handler')
    event.preventDefault();
    sendTasksToRemove();
    sendTasksToPost();
    props.setTasks([])
    props.trigTasks()
    props.getTasks()
    setUpdatedTasks([])
    setRemovedTasks([])
    props.setToOptimize(true)
    // Prevent duplicates after submitting, when user has no tasks prior to submitting new tasks.
    // if (tasks.length === 0) setIsLoaded(true)
    //Reloading page to reload updates jsx.
    window.location.reload();
  };

  const sendTasksToRemove = () => {
    fetch('http://localhost:5000/tasks/DeleteTasks/1', {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(removed_tasks)
    })
        .then((response) => {
          if (response.status === 201) {
            console.log("User's tasks hes been removed successfully.");
            console.log('promise of remove: ',response.text())
          } else {
            console.log("Request status code: " + response.status);
          }
        })
        .catch((error) => {
          console.error("Error while submitting task: " + error.message);
        });
    console.log('end of remove event handler.')
  }

  const sendTasksToPost = () => {
    console.log('tasks to send: ', updated_tasks)
    let s = 'temp_task_id'
    for (const key of Object.keys(updated_tasks))
      delete updated_tasks[key][s]
    fetch('http://localhost:5000/tasks/PostTasks/{tasks}', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(Object.values(updated_tasks))
    })
        .then((response) => {
          if (response.status === 201) {
            console.log("User's tasks hes been sent successfully.");
            console.log(response.text())
          } else {
            console.log("User's tasks hes been sent. HTTP request status code: " + response.status);
          }
        })
        .catch((error) => {
          console.error("Error while submitting task: " + error.message);
        });
  }

  const handleChange = (event, index) => {
    const nam = event.target.name;
    const val = event.target.value;
    let empty_task = {'temp_task_id':index,'user_id':1,'task_title':'', 'duration':'','priority':'','category_id':'','constraints':''};
    let updated = updated_tasks
    // If task is new, create a new instance of it, else edit existing/
    //removes old task when submitting form.
    if (typeof (updated[index-1]) ==='undefined') {
      if (typeof (tasks[index-1]) ==='undefined') {
        updated[index-1] = {...empty_task, [nam]: val}
      } else {
        update_task(index)
        let task_copy = Object.assign({}, tasks[index-1])
        delete task_copy['task_id']
        task_copy['temp_task_id'] = index
        updated[index-1] = {...task_copy, [nam]: val}
      }
    } else {
      updated[index-1][nam] = val
    }
    setUpdatedTasks(updated_tasks)
  }

  const update_task = (i) => {
    if (!(tasks[i-1] in removed_tasks)) {
      setRemovedTasks(prev => [...prev, tasks[i-1].task_id])
    }
  }

  const task_list = tasks_jsx.map((x,index) => (x));
  return (
      <div id='todo_parent_component'>
        <header className="App-header">
          <h1 id='header'>Enter your tasks</h1>
          <form id='container' onSubmit={onSubmitHandler}>
            {task_list}
          </form><br/>
          <input id='submit_button' className="btn btn-primary btn-md" type='submit' form='container'/>
          <div id='add_new_task' onClick={() => addTask(task_number)}/>
        </header>
      </div>
  );

}

export default Todo;
