import React, {useEffect, useState, useRef} from 'react';
import './Schedule.css';

const slots_per_day = 24*2


const Table = (props) => {
    const [tasks, setTasks] = useState([])
    let tasksRef = useRef();
    tasksRef.current = tasks;
    const [tasksID, setTasksID] = useState([])
    const [tasksDict, setTasksDict] = useState([])
    const [draggedGroup, setDraggedGroup] = useState([])
    const prevs = useRef({tasksID, tasksDict, tasks})
    let day = ['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    useEffect(() => {
        setTimeout(() => {
            scrollToThisMoment();
        }, 0)
    }, [])

    useEffect(() => {
        console.log('In sched, user id: ', props.userID)
        if (props.userID === undefined || props.userID === null) return
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
    }, [props.tasksID, tasksID])

    useEffect(() => {
        let date = new Date();
        let today_slot = props.timeToSlot(date.getDay(), null, date.getHours(), date.getMinutes())
        let passed_day = ''
        if (tasksID[0] === undefined) return;
        //console.log(props.categoryTrigger)
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
                    passed_day = ''
                    let data = tasks_id[j + (i - 1) * slots_per_day]
                    if (today_slot > (j + (i - 1) * slots_per_day))
                        passed_day = ' passed'
                    let class_name = getClass(props.categoryTypes[slots_per_day * (i - 1) + j])
                    content.push(<td key={'cell_' + (slots_per_day * (i - 1) + j)} className={class_name}
                                          id={'cell_' + (slots_per_day * (i - 1) + j) + '_taskID_' + tasksID[j + (i - 1) * slots_per_day]}
                                          draggable='true' onDragStart={dragStart} onDrop={drop} onDragOver={allowDrop}
                                          onDragLeave={leaveDropArea}><div className={passed_day}>{data}</div></td>);//{data}
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

    const scrollToThisMoment = () => {
        let date = new Date()
        let today_slot = props.timeToSlot(date.getDay(), null, date.getHours(), date.getMinutes())
        today_slot -= (Math.ceil(today_slot/slots_per_day)-1) * slots_per_day
        console.log('BOOM! ', today_slot)
        document.getElementById('schedule_component1').scrollTop += (window.innerHeight * 0.06) * today_slot;
    }

    const getClass = (number) => {
        switch(number) {
            case 0:
                return 'type_a'
            case 1:
                return 'type_b'
            case 2:
                return 'type_c'
            case 3:
                return 'type_d'
            case 4:
                return 'type_e'
            case 5:
                return 'type_f'
            default:
                return 'empty_slot'
        }
    }

    const getSimilarTasks = (id) => {
        let index = parseInt(id.split('_')[1])
        let targetID = parseInt(id.split('_')[3])
        let res = []
        let toPush;
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

    const drop = (event) => {
        event.preventDefault();
        // drop effect.
        event.target.style.boxShadow = 'none';
        event.target.style.transition = 'box-shadow .2s linear';
        let target_element, slots_to_update = [];
        let ids = event.dataTransfer.getData('text/plain').slice(1,-1).split(",");
        let distance = (parseInt(event.target.id.split('_')[1]) - parseInt(ids[0].split('_')[1]))
        ids = ids.sort(function(elm1, elm2) {
            let elm1Sub = parseInt(elm1.split('_')[1])
            let elm2Sub = parseInt(elm2.split('_')[1])
            if (elm1Sub>elm2Sub) {return 1;}
            else if (elm1Sub === elm2Sub) {return 0;}
            else {return -1;}
        });
        // Calculate the difference between src and dst.
        // //  If out of range for any slot in array, or dropped on an occupied slot, do not drop.
        if (!availableSlots(ids, distance)) return
        // let diff = parseInt(dragged_element.id.split('_')[1]) - parseInt(target_element.id.split('_')[1])
        //Drop all slots with the same ID.
        let tasks_id = tasksID
        for (let i=0; i<ids.length; i++) {
            // Current slot id iterated.
            ids[i] = ids[i].replaceAll('"', '')
            // The element itself.
            let dragged_element = document.getElementById(ids[i]);
            // If dragged slots are in paint mode, do not drop.
            if (dragged_element.ondragover !== null) return
            let target_id = 'cell_' + (parseInt(ids[i].split('_')[1]) + distance)
            target_element = document.querySelector('[id^='+target_id+']')
            // If not an empty slot, not being dropped on an occupied slot and not being dropped to the same slot.
            if (dragged_element.textContent && target_element !== dragged_element) {
                let temp_target_element_text = target_element.textContent
                // Swapping text contents between source and destination slots.
                target_element.childNodes[0].textContent = dragged_element.textContent;
                let src_data = ids[i].split('_')
                let dest_slot = target_element.id.split('_')[1]
                let src_slot = src_data[1]
                let src_task_id = tasks_id[src_slot]
                tasks_id[dest_slot] = parseInt(src_task_id)
                if ((distance > 0 && i < distance) || (distance < 0 && Math.abs(i-(ids.length-1)) < Math.abs(distance))) {
                    dragged_element.childNodes[0].textContent = '';
                    tasks_id[src_slot] = -1
                }
                dragged_element.id = (dragged_element.id.split('_').slice(0,3) + '_' + tasks_id[src_slot]).replaceAll(',','_');
                target_element.id = (target_element.id.split('_').slice(0,3) + '_' + src_task_id).replaceAll(',','_');
                setTasksID(tasks_id)
                slots_to_update.push({'slot_id':src_slot, 'task_id':src_task_id, 'user_id':props.userID, 'new_slot':dest_slot})
            }
        }
        updateTasksLocation(slots_to_update)
        // Update new category after dropping task, if was dropped into one.
        setTimeout(()=> {
            updateTaskCategory(tasks[target_element.id.split('_')[3]])
        }, 500)
        let temp_tasks = {...props.updating_tasks}
        // If task is dragged into a different category slot, change category and send changed to DB.
        if (temp_tasks[ids[0].split('_')[3]]['category_id'] !== parseInt(props.categoryTypes[event.target.id.split('_')[1]])) {
            temp_tasks[ids[0].split('_')[3]]['category_id'] = parseInt(props.categoryTypes[event.target.id.split('_')[1]])
            props.setTasks(temp_tasks)
        }
        event.dataTransfer.clearData();
    }

    const updateTaskCategory = (task) => {
        fetch('http://localhost:5000/tasks/updatetasks/{tasks}', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([task])
        })
            .then((response) => {
                if (response.status === 201) {
                    console.log("User's tasks has been sent successfully.");
                    console.log(response.text())
                } else {
                    console.log("User's tasks hes been sent. HTTP request status code: " + response.status);
                    console.log(response.text())
                }
                //console.log('respones: ', response)
            })
            .catch((error) => {
                console.error("Error while submitting task: " + error.message);
            });
    }

    const availableSlots = (ids, distance) => {
        //console.log('IDS ', ids[0].split('_')[3].split('"')[0])
        let i;
        if (ids[0].split('_')[3].split('"')[0] === '-1' || ids[0]-distance < 0 || ids[ids.length-1] > slots_per_day*7) return false
        // Check all ids drop area
        for (i=0;i<ids.length;i++) {
            let partial_target_id = 'cell_' + (parseInt(ids[i].split('_')[1]) + distance)
            //console.log('partial target id: ', partial_target_id)
            let source_id = ids[i].split('_')[3].split('"')[0]
            let target_id = document.querySelector('[id^='+partial_target_id+']').id.split('_')[3]
            // If dropped area in an occupied slot, return false.
            if(target_id !== '-1' && target_id !== source_id) return false
        }
        return true
    }

    const updateTasksLocation = (dragged_tasks) => {
        console.log('dragged tasks: ', dragged_tasks)
        fetch('http://localhost:5000/tasks/UpdateScheduledTasks/{tasks}', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dragged_tasks)
        })
            .then((response) => {
                if (response.status === 201) {
                    console.log("User's tasks hes been sent successfully.");
                    console.log(response.text())
                } else {
                    console.log("User's tasks hes been sent. HTTP request status code: " + response.status);
                    console.log(response.text())
                }
                //console.log('respones: ', response)
            })
            .catch((error) => {
                console.error("Error while submitting task: " + error.message);
            });
    }

    return (<div id='schedule_component1'>{props.table1}</div>);
}

export default Table;