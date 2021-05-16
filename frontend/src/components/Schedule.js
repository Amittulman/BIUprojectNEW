import React, {useEffect, useState, useRef} from 'react';
import './Schedule.css';

const slots_per_day = 24*2


const Table = (props) => {
    const [tasks, setTasks] = useState([])
    const [tasksID, setTasksID] = useState([])
    const [tasksDict, setTasksDict] = useState([])
    const [draggedGroup, setDraggedGroup] = useState([])
    const prevs = useRef({tasksID, tasksDict, tasks})
    let day = ['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        if (!props.userID) return
        props.getTasksID();
    }, [props.userID])

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
        console.log(props.categoryTrigger)
        if (!props.categoryTrigger) return
        let time_jsx = props.initialSchedule()
        jsx = []
        if (prevs.current.tasksID.toString() !== tasksID.toString() && prevs.current.tasks.toString() !== tasks.toString()) {
            for (let i = 0; i < slots_per_day * 7; i++) {
                if (tasks[tasksID[i]])
                    tasks_id[i] = tasks[tasksID[i]]['task_title']
            }
            for (let i = 1; i < 8; i++) {
                let content = [];
                for (let j = 0; j < slots_per_day; j++) {
                    let data = tasks_id[j + (i - 1) * slots_per_day]
                    let class_name = getClass(props.categoryTypes[slots_per_day * (i - 1) + j])
                    content.push(<td key={'cell_' + (slots_per_day * (i - 1) + j)} className={class_name}
                                     id={'cell_' + (slots_per_day * (i - 1) + j) + '_taskID_' + tasksID[j + (i - 1) * slots_per_day]}
                                     draggable='true' onDragStart={dragStart} onDrop={drop} onDragOver={allowDrop}
                                     onDragLeave={leaveDropArea}>{data}</td>);//{data}
                }
                jsx.push(<tr key={'tr' + i}><th key={'th' + i}>{day[i]}</th>{content}</tr>);
            }
            let table = [<table key='table_schedule'><tbody key='tbody_schedule'>{time_jsx}{jsx}</tbody></table>]
            props.setScheduleTable(table)
            props.setTable(table)
        }
    }, [tasks, tasksID, props.categoryTrigger])

    let content = [];
    let jsx = [];
    let morning = new Set()
    let tasks_id = Array(slots_per_day * 7).fill(null);

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

    const findTask = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            alert('You typed "' + event.target.value + '" in the search box.')
        }
    }

    const dragStart_old = (event) => {
        event.dataTransfer.setData('text/plain', event.target.id);
    }

    const getSimilarTasks = (id) => {
        let index = parseInt(id.split('_')[1])
        let targetID = parseInt(id.split('_')[3])
        let res = []
        let toPush;
        console.log(tasksID[index], targetID)
        console.log(tasksID)
        //iterate prev. tasks ids, add to arr while identical to id's id.
        while (tasksID[index] === targetID) {
            toPush = 'cell_'+index+'_taskID_'+targetID
            res.push(toPush);
            index--;
        }
        index = parseInt(id.split('_')[1]) + 1
        //iterate next tasks ids, add to arr while identical to id's id.
        while (tasksID[index] === targetID) {
            toPush = 'cell_'+index+'_taskID_'+targetID
            res.push(toPush);
            index++;
        }
        setDraggedGroup(res)
        return res
    }

    const dragStart = (event) => {
        //create an array of all ids in an increasing slots order (starting from event.target.id backward and forward).
        let similarTasks = JSON.stringify(getSimilarTasks(event.target.id))
        console.log('similarTasks: ',similarTasks)
        //putting it as second parameter in setData.
        event.dataTransfer.setData('text/plain', similarTasks);
    }

    const allowDrop = (event) => {
        event.preventDefault();
        // do the same for all moved slots
        event.target.style.boxShadow = 'rgba(0, 0, 0, 0.46) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px';
        event.target.style.transition = 'box-shadow .2s linear';
    }

    const leaveDropArea = (event) => {
        event.preventDefault();
        // do the same for all moved slots.
        event.target.style.boxShadow = 'none';
        event.target.style.transition = 'box-shadow .2s linear';
    }

    const drop_old = (event) => {
        event.preventDefault();
        let id = event.dataTransfer.getData('text/plain');
        let dragged_element = document.getElementById(id);
        event.target.style.boxShadow = 'none';
        event.target.style.transition = 'box-shadow .2s linear';
        // If dragged slots are in paint mode, do not drop.
        if (dragged_element.ondragover !== null) return
        if (dragged_element.textContent && !event.target.textContent && event.target !== dragged_element) {
            // Moving content to target slot
            event.target.textContent = dragged_element.textContent;
            // Emptying source slot.
            dragged_element.textContent = '';
            let src_data = id.split('_')
            let dest_slot = event.target.id.split('_')[1]
            let src_slot = src_data[1]
            let tasks_id = tasksID
            let src_task_id = tasks_id[src_slot]
            tasks_id[dest_slot] = parseInt(src_task_id)
            tasks_id[src_slot] = -1
            setTasksID(tasks_id)
            updateTaskLocation(src_slot, dest_slot, src_task_id)
        }
        event.dataTransfer.clearData();
    }

    const drop = (event) => {
        event.preventDefault();
        let ids = event.dataTransfer.getData('text/plain').slice(1,-1).split(",");
        //Drop all slots with the same ID.
        for (let i=0; i<ids.length; i++) {
            ids[i] = ids[i].replaceAll('"', '')
            console.log('dragged single id: ', ids[i])
            let dragged_element = document.getElementById(ids[i]);
            event.target.style.boxShadow = 'none';
            event.target.style.transition = 'box-shadow .2s linear';
            if (dragged_element.ondragover !== null) return
            if (dragged_element.textContent && !event.target.textContent && event.target !== dragged_element) {
                let testing = props.schedRef.current;
                // console.log('testing1: ', testing)
                // testing[0].readOnly = false
                // testing[0]['props']['children']['props']['children'][1][2]['props']['children'][1][0]['props']['id'] = 5
                // console.log('testing2: ', testing[0]['props']['children']['props']['children'][1][2]['props']['children'][1][0]['props']['id'])
                props.setTable(props.schedRef.current)
                event.target.textContent = dragged_element.textContent;
                dragged_element.textContent = '';
                let src_data = ids[i].split('_')
                let dest_slot = event.target.id.split('_')[1]
                let src_slot = src_data[1]
                let tasks_id = tasksID
                let src_task_id = tasks_id[src_slot]
                tasks_id[dest_slot] = parseInt(src_task_id)
                tasks_id[src_slot] = -1
                setTasksID(tasks_id)
                updateTaskLocation(src_slot, dest_slot, src_task_id)
            }
        }
        event.dataTransfer.clearData();
    }

    const updateTaskLocation = (src_slot, dest_slot, task_id) => {
        let data_to_send = {'slot_id': parseInt(src_slot), 'task_id': parseInt(task_id), 'user_id': props.userID}
        console.log('a!!! ', data_to_send)
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
    return (<div id='schedule_component1'>{props.table1}</div>);
}

export default Table;