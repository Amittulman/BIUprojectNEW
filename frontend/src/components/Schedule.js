import React, {useEffect, useState} from 'react';
import './Schedule.css';
import Menu from "./Menu";

const slots_per_day = 24*2


const Table = (props) => {
    const [tasks, setTasks] = useState([])

    useEffect(() => {
        props.getTasks()
    }, [])

    useEffect(() => {
       setTasks(props.updating_tasks)
    }, [props.updating_tasks])

    let tasks_ids = props.getTasksID();
    console.log('tasks in Table: ',tasks)
    console.log('tasksID in Table: ',tasks_ids)
    let title = <title id='title'>Your schedule for the week</title>;
    let search_input = <input onKeyPress={findTask} id='input' type='text' placeholder='Search Task...'/>;
    let search = <div>{search_input}</div>
    let day = ['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let jsx= [];
    let tasks_id = Array(slots_per_day*7).fill(null);
    let tasks_dct = {};
    // adding random values to tasks_id
    // TODO - get tasks_id from backend instead.
    for (let i=0;i<tasks.length;i++) {
        tasks_dct[tasks[i]['task_id']] = tasks[i]['task_title']
    }
    console.log('dictionary: ', tasks_dct)
    for (let i=0; i< slots_per_day*7;i++) {
        tasks_id[i] = tasks_dct[tasks_ids[i]]
    }
    for (let i=0; i<8; i++) {
        let content = [];
        let hour;
        let minute = 0;
        if (day[i] === 'Time') {
            for (let j=0; j<slots_per_day; j++) {
                hour = Math.floor(j/2);
                minute = 30 * (j%2);
                if (hour < 10) hour = '0' + hour
                if (minute === 0) minute = '00'
                content.push(<td key={'time'+hour+':'+minute}>{hour}:{minute}</td>);
            }
        } else {
            for (let j=0; j<slots_per_day; j++) {
                let a = tasks_id[j+(i-1)*32]
                content.push(<td key={'cell_'+[i,j]} id={'cell_'+[i,j]} draggable='true' onDragStart={dragStart} onDrop={drop} onDragOver={allowDrop} onDragLeave={leaveDropArea}>{a}</td>);
            }
        }
        jsx.push(<tr key={'tr'+i}><th key={'th'+i}>{day[i]}</th>{content}</tr>);
    }
    let table = <table><tbody>{jsx}</tbody></table>
    return (<div><div id='site_top'><Menu/>{search}</div>{table}</div>);
}

const findTask = (event) => {
    if (event.key === 'Enter') {
        event.preventDefault()
        alert('You typed "' + event.target.value + '" in the search box.')
    }
}

const dragStart = (event) => {
    event.dataTransfer.setData('text/plain', event.target.id);
}

const allowDrop = (event) => {
    event.preventDefault();
    event.target.style.boxShadow = 'rgba(0, 0, 0, 0.46) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px';
    event.target.style.transition = 'box-shadow .2s linear';
}

const leaveDropArea = (event) => {
    event.preventDefault();
    event.target.style.boxShadow = 'none';
    event.target.style.transition = 'box-shadow .2s linear';
}

const drop = (event) => {
    event.preventDefault();
    let id = event.dataTransfer.getData('text/plain');
    let dragged_element = document.getElementById(id);
    event.target.style.boxShadow = 'none';
    event.target.style.transition = 'box-shadow .2s linear';
    // TODO: remove second condition, so it will be possible to drag into an occupied slot.
    if (dragged_element.textContent && !event.target.textContent && event.target !== dragged_element) {
        event.target.textContent = dragged_element.textContent;
        dragged_element.textContent = '';
    }
    // event.target.appendChild(element);
    event.dataTransfer.clearData();
}


export default Table;