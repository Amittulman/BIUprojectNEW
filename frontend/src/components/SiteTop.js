import './SiteTop.css'
import React, {useState} from 'react';

const slots_per_day = 24*2;

const SiteTop = (props) => {
    const [test, setTest] = useState(true);

    const changeCategoryButton = () => {
        let category_button = document.getElementById('category_button')
        if (category_button.className === 'category_button') {
            category_button.classList.remove('category_button')
            category_button.classList.add('category_button_clicked')
            category_button.title ='Back'
        } else {
            category_button.classList.remove('category_button_clicked')
            category_button.classList.add('category_button')
            category_button.title ='Modify Categories'
        }
    }


    const dragStartCat = (event) => {
        event.dataTransfer.setData('text/plain', event.target.id);
    }

    const allowDropCat = (event) => {
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

    const paintSlots = (sched) => {
        let i, j;
        for (i=1 ; i<8;i++) {
            for (j=1 ; j < slots_per_day+1 ; j++) {
                // let class_name = getClass( categoryTypes[slots_per_day * (i - 1) + (j-1)])
                let node = sched.childNodes.item(0).childNodes.item(0).childNodes.item(0).childNodes.item(i).childNodes.item(j)
                // node.className = class_name//class_name
                node.ondragstart = dragStartCat
                node.ondragover = allowDropCat
                node.onclick = allowDropCat
                // node.ondrop = null
                // node.ondragleave = null
                node.draggable = true
            }
        }
    }

    const unpaintSlots = (sched) => {
        let i, j;
        //console.log(sched.length)
        for (i=1 ; i<8;i++) {
            for (j=1 ; j < slots_per_day+1 ; j++) {
                let node = sched.childNodes.item(0).childNodes.item(0).childNodes.item(0).childNodes.item(i).childNodes.item(j)
                // node.className = 'empty_slot';
                node.ondragstart = null
                node.ondragover = null
                node.onclick = null
                node.ondrop = null
                node.ondragleave = null
                node.draggable = true
            }
        }
    }

    const showCategories = () => {
        changeCategoryButton()
        let category_options = document.getElementsByClassName('category_option')
        let category_button = document.getElementById('category_button')
        let sched = document.getElementById('schedule_component')
        let cat = document.getElementById('category_component')
        let display_type;
        if (category_options[0].style.opacity === '0' || !category_options[0].style.opacity) {
            display_type = 'block'
        }
        else {
            display_type = 'none'
        }
        for (let i=0; i < category_options.length; i++) {
            // category_options[i].style.display = display_type;
            if (category_button.className === 'category_button') {
                category_options[i].style.opacity = '0';
                category_options[i].style.marginLeft = '-30px';
            } else {
                category_options[i].style.opacity = '1';
                category_options[i].style.marginLeft = '2px';
            }
        }
        if (display_type === 'block') {
            setTest(false)
            paintSlots(sched)
        }
        else {
            setTest(true)
            unpaintSlots(sched)
        }
    }

    const findTask = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            alert('You typed "' + event.target.value + '" in the search box.')
        }
    }

    const userIDHandler = (event) => {
        props.setUserID(parseInt(event.target.parentElement.childNodes[0].childNodes[0].value))
    }

    const LogoutWrapper = () => {
        props.setUserID(undefined)
        localStorage.setItem('userID', null)
        localStorage.setItem('rememberMe', 'false')
        window.location.href = '/'
    }

    let login_input = <input onKeyPress={findTask} id='input' name='user_id_input' type='text' placeholder='Enter ID number'/>;
    let time_of_day = new Date().getHours()
    let greeting;
    if (time_of_day < 12) greeting = 'Good morning'
    else if (time_of_day < 18) greeting = 'Good afternoon'
    else greeting = 'Good evening'
    return (
        <div id='site_top' className='row flex-grow-0'>

            {/*<div className='userContainer'>*/}
            {/*    <div className='greeting'>{greeting}, Moshe! 👋</div>*/}
            {/*</div>*/}
            <div id='login_title'>BeeZee</div>
            <div className='col-2'/>
            <div data-toggle="tooltip" title="Modify Categories" onClick={showCategories} id='category_button' className='category_button'/>
            <div data-toggle="tooltip" title="Type A" id='type_a_button' onClick={()=>props.setOption(0)} className='category_option'>Work</div>
            <div data-toggle="tooltip" title="Type B" id='type_b_button' onClick={()=>props.setOption(1)} className='category_option'>Leisure</div>
            <div data-toggle="tooltip" title="Type C" id='type_c_button' onClick={()=>props.setOption(2)} className='category_option'>Sleep</div>
            {/*TODO - implement "add category button    "*/}
            <div data-toggle="tooltip" title="Type C" id='add_category_button' onClick={(e)=>{
                let new_cat_container = document.getElementById('adding_category_container')
                if (new_cat_container.style.visibility === 'visible') new_cat_container.style.visibility = 'hidden'
                else new_cat_container.style.visibility = 'visible'
            }} className='category_option'>
            <div id='adding_category_container'>
                Title: <input id='category_dialog'/>
                {/*Color: <input id='category_dialog'/>*/}
                Color: <span id='new_category_option_1'/><span id='new_category_option_2'/><span id='new_category_option_3'/>
                <span id='category_accept_changes'/>
            </div>
            </div>
            <div data-toggle="tooltip" title="Clear" id='clear_category_button' onClick={()=>props.setOption(-1)} className='category_option'/>
            {/*TODO:show indicator of sending category.*/}
            <div data-toggle="tooltip" title="Send" id='category_send_button' onClick={()=>{props.handleCategoriesSubmission(); showCategories(); props.setCategoryTrigger(!props.categoryTrigger)}} className='category_option'/>
            {/*<div className='col-4'>{login}</div>*/}
            <div id='logout' onClick={LogoutWrapper}>Log out</div>
        </div>
    );
}

export default SiteTop;