import React, {useEffect} from 'react';
import './Schedule.css';

const slots_per_day = 24*2


const Categories = (props) => {
    let day = ['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];


    useEffect(() => {
        if (props.userID === undefined || props.userID === 'null') return
        // console.log('FETCH CAT ',  props.userID, props.userID === null, props.userID === 'null')
        getCategories()
        props.setScheduleJsx(props.initialScedule())
    }, [props.userID]);

    useEffect(() => {
        if(!props.scheduleJsx.length) return
        markCategories()
    }, [props.categoryTypes,props.scheduleTrigger])

    const getClass = (number) => {
        // console.log('DEF')
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

    const markCategories = () => {
        return;
        if (!props.scheduleJsx.length) return
        for (let i = 1; i < 8; i++) {
            let empty_content = []
            for (let j = 0; j < slots_per_day; j++) {
                let class_name = getClass(props.categoryTypes[slots_per_day * (i - 1) + j])
                empty_content.push(<td key={'cell_' + (slots_per_day * (i - 1) + j) + '_empty'}
                                       id={'cell_' + (slots_per_day * (i - 1) + j) + '_empty'} className={class_name}
                                       draggable='true' onDragStart={dragStart} onClick={allowDropCategory} onDragOver={allowDropCategory}/>);
            }
            props.scheduleJsx.push(<tr key={'tr_cat_' + i + '_empty'}>
                <th key={'th' + i + '_empty'}>{day[i]}</th>
                {empty_content}</tr>)
        }
        let empty_table = [<table key='category_table' id='category_table'><tbody>{props.scheduleJsx}</tbody></table>]
        props.setCategoryTable(empty_table)
    }

    const dragStart = (event) => {
        // console.log('start1')
        event.dataTransfer.setData('text/plain', event.target.id);
    }

    const allowDropCategory = (event) => {
        // console.log('ALLOW DROP CATEGORY')
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
        // debugger
        props.categoryTypes[event_slot] = ref
        props.setCategoryTypes(props.categoryTypes)
    }

    useEffect(() => {
        props.setCategoryTable( [<table key='category_table' id='category_table'><tbody>{props.scheduleJsx}</tbody></table>])

    }, [props.scheduleJsx])

    const getCategories = () => {
        fetchCategories('GetUserCategorySlots')
        props.setTable(props.categoryTable)
    }

    const fetchCategories = (type) => {
        fetch("http://localhost:5000/tasks/"+type+"/"+props.userID)
            .then(res => res.json())
            .then(
                (result) => {
                    //console.log(result)
                    if (result['statusCode'] === 500) throw new Error('Internal server error.');
                    // debugger
                    props.setCategoryTypes(result)
                    props.setCategoryTrigger(true)
                    // setCategoryTable(result)
                })
            .catch((error) => {
                //console.log(error)
            });
    }
    return (<div id='category_component1'>{props.categoryTable}</div>);
}

export default Categories