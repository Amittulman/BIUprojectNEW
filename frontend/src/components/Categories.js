import React, {useEffect} from 'react';
import './Schedule.css';

const SLOTS_PER_DAY = 24*2
const day = ['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS = 7

const Categories = (props) => {
    useEffect(() => {
        if (props.userID === undefined || props.userID === 'null') return
        getCategories()
        props.setScheduleJsx(props.initialScedule())
    }, [props.userID]);

    useEffect(() => {
        if(!props.scheduleJsx.length) return
        markCategories()
    }, [props.categoryTypes,props.scheduleTrigger])

    //Getting class number by its index number.
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

    //Creating table jsx elements and marking each slot, considering category type.
    const markCategories = () => {
        return;
        if (!props.scheduleJsx.length) return
        for (let i = 1; i < WEEKDAYS+1; i++) {
            let empty_content = []
            for (let j = 0; j < SLOTS_PER_DAY; j++) {
                let class_name = getClass(props.categoryTypes[SLOTS_PER_DAY * (i - 1) + j])
                empty_content.push(<td key={'cell_' + (SLOTS_PER_DAY * (i - 1) + j) + '_empty'}
                                       id={'cell_' + (SLOTS_PER_DAY * (i - 1) + j) + '_empty'} className={class_name}
                                       draggable='true' onDragStart={dragStart} onClick={allowDropCategory} onDragOver={allowDropCategory}/>);
            }
            props.scheduleJsx.push(<tr key={'tr_cat_' + i + '_empty'}>
                <th key={'th' + i + '_empty'}>{day[i]}</th>
                {empty_content}</tr>)
        }
        let empty_table = [<table key='category_table' id='category_table'><tbody>{props.scheduleJsx}</tbody></table>]
        props.setCategoryTable(empty_table)
    }

    // Start drag event handler.
    const dragStart = (event) => {
        event.dataTransfer.setData('text/plain', event.target.id);
    }

    //On drag event handler.
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
        props.categoryTypes[event_slot] = ref
        props.setCategoryTypes(props.categoryTypes)
    }

    //Whenever something have changed in schedule table, update it in UI.
    useEffect(() => {
        props.setCategoryTable( [<table key='category_table' id='category_table'><tbody>{props.scheduleJsx}</tbody></table>])
    }, [props.scheduleJsx])

    const getCategories = () => {
        fetchCategories('GetUserCategorySlots')
        props.setTable(props.categoryTable)
    }

    // Fetching categories list from DB.
    const fetchCategories = (type) => {
        fetch("http://localhost:5000/tasks/"+type+"/"+props.userID)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result['statusCode'] === 500) throw new Error('Internal server error.');
                    props.setCategoryTypes(result)
                    props.setCategoryTrigger(true)
                })
            .catch((error) => {
                console.log(error)
            });
    }
    return (<div id='category_component1'>{props.categoryTable}</div>);
}

export default Categories