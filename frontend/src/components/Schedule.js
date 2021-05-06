import React, {useEffect, useState, useRef} from 'react';
import './Schedule.css';
import Menu from "./Menu";

const slots_per_day = 24*2


const Table = (props) => {
    const [tasks, setTasks] = useState([])
    const [tasksID, setTasksID] = useState([])
    const [tasksDict, setTasksDict] = useState([])
    const [table1, setTable] = useState([])
    const [boo, setBoo] = useState(false)
    const prevs = useRef({tasksID, tasksDict, tasks})

    useEffect(() => {
        props.getTasksID();
    }, [])

    useEffect(() => {
        if (props.updating_tasks.length === 0) return
        setTasks(props.updating_tasks)
    }, [props.updating_tasks])

    useEffect(() => {
        let tasks_dct = {};
        for (let i = 0; i < tasks.length; i++) {
            tasks_dct[tasks[i]['task_id']] = tasks[i]['task_title']
        }
        setTasksDict(tasks_dct)
    }, [tasks])

    useEffect(() => {
        setTasksID(props.tasksID)
    }, [props.tasksID])


    useEffect(() => {
        initialSchedule()
        let time_jsx = [...jsx]
        jsx = []
        if (prevs.current.tasksID.toString() !== tasksID.toString() && prevs.current.tasks.toString() !== tasks.toString()) {
            for (let i = 0; i < slots_per_day * 7; i++) {
                if (tasks[tasksID[i]])
                    tasks_id[i] = tasks[tasksID[i]]['task_title']
            }
            for (let i = 1; i < 8; i++) {
                let content = [];
                for (let j = 0; j < slots_per_day; j++) {
                    let a = tasks_id[j + (i - 1) * slots_per_day]
                    content.push(<td key={'cell_' + (slots_per_day * (i - 1) + j)}
                                     id={'cell_' + (slots_per_day * (i - 1) + j) + '_taskID_' + tasksID[j + (i - 1) * slots_per_day]}
                                     draggable='true' onDragStart={dragStart} onDrop={drop} onDragOver={allowDrop}
                                     onDragLeave={leaveDropArea}>{a}</td>);
                }
                console.log('saba, ', jsx)
                jsx.push(<tr key={'tr' + i}><th key={'th' + i}>{day[i]}</th>{content}</tr>);
            }
            let x = [<table><tbody>{time_jsx}{jsx}</tbody></table>]
            setTable(x)
        }
    }, [tasks, tasksID])

    const initialSchedule = () => {
        let hour;
        let minute = 0;
        for (let j = 0; j < slots_per_day; j++) {
            hour = Math.floor(j / 2);
            minute = 30 * (j % 2);
            if (hour < 10) hour = '0' + hour
            if (minute === 0) minute = '00'
            content.push(<td key={'time' + hour + ':' + minute}>{hour}:{minute}</td>);
        }
        jsx.push(<tr key={'tr' + 0}><th key={'th' + 0}>Time</th>{content}</tr>);
    }

    let content = [];
    let jsx = [];
    let day = ['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let tasks_id = Array(slots_per_day * 7).fill(null);

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
            let src_data = id.split('_')
            let dest_slot = event.target.id.split('_')[1]
            let src_slot = src_data[1]
            let tasks_id = tasksID
            let src_task_id = tasks_id[src_slot]
            tasks_id[dest_slot] = parseInt(src_task_id)
            tasks_id[src_slot] = -1
            setTasksID(tasks_id)
            updateTaskLocation(src_slot, dest_slot, src_task_id, 1)
        }
        event.dataTransfer.clearData();
    }

    const updateTaskLocation = (src_slot, dest_slot, task_id, user_id) => {
        let data_to_send = {'slot_id': parseInt(src_slot), 'task_id': parseInt(task_id), 'user_id': user_id}
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
    return (<div id='test'>{table1}</div>);
}

export default Table;