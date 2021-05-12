import React, {useEffect, useState, useRef} from 'react';
import './Schedule.css';

const slots_per_day = 24*2


const Categories = (props) => {
    let day = ['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


    useEffect(() => {
        getCategories()
        props.setScheduleJsx(props.initialScedule())
    }, []);

    useEffect(() => {
        if(!props.scheduleJsx) return
        markCategories()
    }, [props.timeOfDay,props.scheduleTrigger])


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

    const markCategories = () => {
        if (!props.scheduleJsx) return
        const slots_per_day = 24*2
        for (let i = 1; i < 8; i++) {
            let empty_content = []
            for (let j = 0; j < slots_per_day; j++) {
                let class_name = getClass(props.timeOfDay[slots_per_day * (i - 1) + j])
                empty_content.push(<td key={'cell_' + (slots_per_day * (i - 1) + j) + '_empty'}
                                       id={'cell_' + (slots_per_day * (i - 1) + j) + '_empty'} className={class_name}
                                       draggable='true' onDragStart={dragStart} onClick={allowDropCategory} onDragOver={allowDropCategory}
                />);
            }
            props.scheduleJsx.push(<tr key={'tr' + i + '_empty'}>
                <th key={'th' + i + '_empty'}>{day[i]}</th>
                {empty_content}</tr>)
        }
        let empty_table = [<table key='category_table' id='category_table'><tbody>{props.scheduleJsx}</tbody></table>]
        props.setCategoryTable(empty_table)
    }

    const dragStart = (event) => {
        event.dataTransfer.setData('text/plain', event.target.id);
    }

    const allowDropCategory = (event) => {
        let ref = props.optionRef.current
        event.preventDefault();
        switch (props.optionRef.current){
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
        props.timeOfDay[event_slot] = ref
        props.setTimeOfDay(props.timeOfDay)
    }

    useEffect(() => {
        console.log('jsx: ', props.scheduleJsx)
        props.setCategoryTable( [<table key='category_table' id='category_table'><tbody>{props.scheduleJsx}</tbody></table>])

    }, [props.scheduleJsx])

    const getCategories = () => {
        // TODO - get categories from server
        let user_id = 1
        fetchCategories('GetUserCategorySlots', user_id)
        // TODO - after that, call markCategories and add classname to relevant slots, based on slot value received.
        props.setTable(props.categoryTable)
    }


    const fetchCategories = (type, user_id=1) => {
        fetch("http://localhost:5000/tasks/"+type+"/"+user_id)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result['statusCode'] === 500) throw new Error('Internal server error.');
                    props.setTimeOfDay(result)
                    // setCategoryTable(result)
                })
            .catch((error) => {
                console.log(error)
            });
    }
    return (<div id='category_component1'>{props.categoryTable}</div>);
}

export default Categories