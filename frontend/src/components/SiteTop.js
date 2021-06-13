import './SiteTop.css'
import React, {useEffect, useRef, useState} from 'react';
import {classNamesShape} from "react-transition-group/cjs/utils/PropTypes";

const slots_per_day = 24*2;

const SiteTop = (props) => {
    const [test, setTest] = useState(true);
    const [currentCat, setCurrentCat] = useState();
    const currentCatRef = useRef();
    currentCatRef.current = currentCat;
    const [categoryColor, setCategoryColor] = useState(0);
    const catColorRef = useRef();
    catColorRef.current = categoryColor;
    const [totalNewCat, setTotalNewCat] = useState(0);

    useEffect(() => {
        if (props.userID !== undefined)
            getCategories();
    }, [props.userID])

    useEffect(() => {
        console.log('TRIGGERED! ', props.categories)
        //Send changes to DB.
        if (props.categories.length !== 0)
            postCategories();
        // Add categories, received from DB.
        addLoadedCategories();
    }, [props.categories])

    useEffect(()=> {
        console.log('OPTIONS REF')
    }, [props.optionRef])

    const getCategories = () => {
        fetch("http://localhost:5000/tasks/GetCategories/"+props.userID)
            .then(res => res.json())
            .then(
                (result) => {
                    console.log('Get categories result: ', result);
                    if (result.length === 0)
                        result = getDefaultCategories();
                    props.setCategories(result);
                })
            .catch((error) => {
                console.log(error)
            });
    }

    const postCategories = () => {
        fetch('http://localhost:5000/tasks/PostCategories/', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(props.categories)
        })
            .then((response) => {
                // setCategoryTable(response)
                if (response.status === 201) {
                    console.log("User's tasks hes been sent successfully.");
                } else {
                    //console.log("User's tasks hes been sent. HTTP request status code: " + response.status);
                }
                console.log(response.text())
            })
            .catch((error) => {
                console.error("Error while submitting task: " + error.message);
            });
    }

    const getDefaultCategories = () => {
        return [{"user_id":props.userID,"category_id":0,"category_name":"Work","color":"#FFE9E9"},
            {"user_id":props.userID,"category_id":1,"category_name":"Liesure","color":"#FFFFE2"},
            {"user_id":props.userID,"category_id":2,"category_name":"Sleep","color":"#E9EDFF"},
            {"user_id":props.userID,"category_id":3,"category_name":"","color":""},
            {"user_id":props.userID,"category_id":4,"category_name":"","color":""},
            {"user_id":props.userID,"category_id":5,"category_name":"","color":""}]
    }

    const hideRest = () => {
        let cats = document.getElementsByClassName('user_category')
        for (let i=0; i<cats.length; i++) {
            if (cats[i].innerText === '') continue
            // debugger
            cats[i].childNodes[1].style.visibility = 'hidden';
        }
    }

    const addLoadedCategories = () => {
        if (document.getElementsByClassName('category').length > 0) return;
        //Loading categories.
        for (let i=0; i<props.categories.length; i++) {
            let container = document.getElementById('site_top')
            // Adding a category
            let new_category = document.createElement('div');
            new_category.id='added_button_' + i
            new_category.className = 'category_option category user_category';
            new_category.innerText = props.categories[i]['category_name']
            new_category.style.backgroundColor = props.categories[i]['color']
            // Adding category's edit button.
            let edit_cat = document.getElementById('edit_cat'+i)
            edit_cat = document.createElement('div');
            edit_cat.id = 'edit_cat' + i;
            edit_cat.className = 'edit_cat';
            new_category.appendChild(edit_cat)
            let new_cat_container= document.getElementById('adding_category_container');
            let category_accept_changes = document.getElementById('category_accept_changes');
            // edit_cat.appendChild(new_cat_container)
            category_accept_changes.onclick = (e)=> {
                // Do not save changes if title is empty.
                if (document.getElementById('category_dialog').value === '' || catColorRef.current === 0) return;
                if (props.categories[currentCatRef.current]['category_name'] === '') {
                    let new_cat = document.getElementById('added_button_' + currentCatRef.current)
                    new_cat.style.opacity = '1';
                    new_cat.style.visibility = 'visible';
                    new_cat.style.display = 'block';
                    new_cat.style.marginLeft = '2px';
                }
                debugger
                new_cat_container.style.visibility = 'hidden';
                // Update category changes in both frontend and DB.
                setCategories();
            }
            let category_decline_changes = document.getElementById('category_decline_changes');
            category_decline_changes.onclick = () => {new_cat_container.style.visibility = 'hidden';}
            edit_cat.onclick = () => {
                edit_cat.style.visibility = 'hidden'
                //Reset title value, when editing title and color of category.
                document.getElementById('category_dialog').value = ''
                // new_cat_container.style.marginLeft = '-200px'
                new_cat_container.style.visibility = 'visible'
            }
            // Showing editing option and marking option.
            new_category.onclick =  (e) => {
                setCurrentCat(i);
                if (!e.target.id || (!e.target.id.startsWith('added_button') && !e.target.id.startsWith('remove_cat'))) return;
                props.setOption(i);
                if (edit_cat.style.visibility === 'visible')
                    edit_cat.style.visibility = 'hidden';
                else {
                    hideRest()
                    edit_cat.style.visibility = 'visible';
                    new_cat_container.style.visibility = 'hidden';
                }
            }
            container.insertBefore(new_category, container.childNodes[container.childNodes.length-5]);
        }
        setTotalNewCat(props.categories.length)
    }

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
        console.log('start3')
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
            case 3:
                event.target.className = 'type_d'
                break;
            case 4:
                event.target.className = 'type_e'
                break;
            case 5:
                event.target.className = 'type_f'
                break;
            default:
                event.target.className = 'empty_slot'
                break;
        }

        if (props.categories[props.optionRef.current] !== undefined)
            event.target.style.backgroundColor = props.categories[props.optionRef.current]['color']
        else
            event.target.style.backgroundColor = 'transparent'
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
                // node.onDrop = null
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
                node.onDragStart = null
                node.onDragOver = null
                node.onclick = null
                node.onDrop = null
                node.ondragleave = null
                node.draggable = true
            }
        }
    }

    const showCategories = () => {
        changeCategoryButton()
        let category_options = document.getElementsByClassName('category_option')
        let category_button = document.getElementById('category_button')
        // Hide creating a new category pane when closing categories list.
        document.getElementById('adding_category_container').style.visibility = 'hidden'
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
            console.log('ZZZZZ ', category_options[i])
            if (category_options[i].id.startsWith('added_button') && category_options[i].textContent === ''){
                category_options[i].style.display = 'none'
                  console.log('ABBA ', i, category_options[i], category_options[i].className.includes('user_category') && category_options[i].textContent === '')
                continue
            }
            // Collapsing categories.
            if (category_button.className === 'category_button') {
                hideRest()
                category_options[i].style.opacity = '0';
                category_options[i].style.visibility = 'hidden';
                category_options[i].style.marginLeft = '-40px';
            // Expanding categories.
            } else {
                category_options[i].style.opacity = '1';
                category_options[i].style.visibility = 'visible';
                // category_options[i].style.display = 'block';
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

    const createNewCategory = () => {
        // Hide creating a new category pane.
        document.getElementById('adding_category_container').style.visibility = 'hidden'
        console.log('category color ', categoryColor)
        if (totalNewCat >= 3) return
        let title = document.getElementById('category_dialog').value
        let colors = document.getElementsByClassName('category_colors')
        if (title.length === 0 || categoryColor === 0) return
        let container = document.getElementById('site_top')
        let new_category = document.createElement('div');
        new_category.id='added_button_'+categoryColor
        new_category.className = 'category_option';
        new_category.innerText = title
        new_category.style.opacity = '1'
        new_category.style.marginLeft = '2px'
        // new_category.style.backgroundColor = '2px'
        new_category.onclick =  () => props.setOption(2+categoryColor)
        container.insertBefore(new_category, container.childNodes[container.childNodes.length-5]);
        setTotalNewCat(totalNewCat+1)
    }

    const setCategories = () => {
        let edit_cat = document.getElementById('edit_cat'+currentCatRef.current)
        let colors = {1:'#E2FFFF', 2:'#FFF0D7', 3:'#E2E6FF', 4:'#FFCFCF', 5:'#FEE2FF', 6:'#E8FFE2'};
        let temp_cat = [...props.categories]
        // Updating new value.
        temp_cat[currentCatRef.current]['category_name'] = document.getElementById('category_dialog').value
        temp_cat[currentCatRef.current]['color'] = colors[catColorRef.current]
        props.setCategories(temp_cat)
        // Sending changed to DB.
        postCategories()
        // Changing category value in frontend.
        let new_category = document.getElementById('added_button_' + currentCatRef.current)
        new_category.innerText = props.categories[currentCatRef.current]['category_name']
        new_category.style.backgroundColor = props.categories[currentCatRef.current]['color']
        new_category.appendChild(edit_cat)
    }

    const getFirstEmptyCat = () => {
        for (let i=0; i<props.categories.length; i++) {
            if (props.categories[i].category_name === '')
                return i;
        }
        return null
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
            <div className='col-2' id='blank_col'/>
            <div data-toggle="tooltip" title="Modify Categories" onClick={showCategories} id='category_button' className='category_button'/>
            {/*<div data-toggle="tooltip" title="Work" id='type_a_button' onClick={()=>props.setOption(0)} className='category_option'>Work</div>*/}
            {/*<div data-toggle="tooltip" title="Leisure" id='type_b_button' onClick={()=>props.setOption(1)} className='category_option'>Leisure</div>*/}
            {/*<div id='type_c_button' data-toggle="tooltip" title="Sleep"  onClick={()=>props.setOption(2)} className='category_option'>Sleep</div>*/}
            <div data-toggle="tooltip" title="Add category" id='add_category_button' onClick={(e)=>{
                document.getElementById('category_dialog').value = ''
                setCurrentCat(()=>getFirstEmptyCat());
                props.setOption(()=>getFirstEmptyCat());
                let new_cat_container = document.getElementById('adding_category_container')
                if (new_cat_container.style.visibility === 'visible') {
                    if (e.target.id === 'add_category_button')
                        new_cat_container.style.visibility = 'hidden'
                }
                else {
                    hideRest()
                    new_cat_container.style.visibility = 'visible'
                }
            }} className='category_option'>
            </div>
            <div data-toggle="tooltip" title="Clear" id='clear_category_button' onClick={()=>{hideRest(); props.setOption(-1)}} className='category_option'/>
            {/*TODO:show indicator of sending category.*/}
            <div data-toggle="tooltip" title="Send" id='category_send_button' onClick={()=>{props.handleCategoriesSubmission(); showCategories(); props.setCategoryTrigger(!props.categoryTrigger)}} className='category_option'/>
            <div id='adding_category_container'>
                Title:
                <input id='category_dialog'/>
                Color:
                <span id='new_category_option_1' className='category_colors' onClick={()=>setCategoryColor(1)}/>
                <span id='new_category_option_2' className='category_colors' onClick={()=>setCategoryColor(2)}/>
                <span id='new_category_option_3' className='category_colors' onClick={()=>setCategoryColor(3)}/>
                <span id='new_category_option_4' className='category_colors' onClick={()=>setCategoryColor(4)}/>
                <span id='new_category_option_5' className='category_colors' onClick={()=>setCategoryColor(5)}/>
                <span id='new_category_option_6' className='category_colors' onClick={()=>setCategoryColor(6)}/>
                <span id='category_accept_changes'/>
                <span id='category_decline_changes'/>
            </div>
            {/*<div className='col-4'>{login}</div>*/}
            <div id='logout' onClick={LogoutWrapper}>Log out</div>
        </div>
    );
}

export default SiteTop;