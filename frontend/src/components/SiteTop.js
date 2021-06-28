import './SiteTop.css'
import React, {useEffect, useRef, useState} from 'react';
import siteLogo from '../images/BEEZEELOGO.png';

const slots_per_day = 24*2;

const SiteTop = (props) => {
    const [test, setTest] = useState(true);
    const [username, setUsername] = useState();
    const [currentCat, setCurrentCat] = useState();
    const currentCatRef = useRef();
    currentCatRef.current = currentCat;
    const [categoryColor, setCategoryColor] = useState(0);
    const catColorRef = useRef();
    catColorRef.current = categoryColor;
    const [totalNewCat, setTotalNewCat] = useState(0);
    const [changedCategories, setChangedCategories] = useState([])
    const [newCat, setNewCat] = useState(false);
    const newCatref = useRef();
    newCatref.current = newCat;

    // // Automatically opening category pane.
    // useEffect(() => {
    //     setTimeout(() => {
    //         showCategories();
    //     },1000)
    // }, [])

    useEffect(() => {
        if (localStorage.getItem('nextWeek').split('_')[0] === 't') {
            document.getElementById('schedule_for_next_week_text').innerText = 'Next Week'
        } else {
            document.getElementById('schedule_for_next_week_text').innerText = 'This Week'
        }
        if (props.userID !== undefined && props.userID !== 'null'){
            getCategories();
            getUsername()
        }
    }, [props.userID])

    useEffect(() => {
        if (!username) return
        let greeting = document.getElementById('greeting')
        greeting.style.visibility = 'visible';
        greeting.style.opacity = '1'
    }, [username])

    useEffect(() => {
        console.log('TRIGGERED! ', props.categories)
        if (props.categories === undefined) return
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
        //debugger
        // console.log('USER ID IN CATTT ', props.userID)
        fetch("http://localhost:5000/tasks/GetCategories/"+props.userID)
            .then(res => res.json())
            .then(
                (result) => {
                    console.log('Get categories result: ', result);
                    if (result.length === 0)
                        result = getDefaultCategories();
                    // console.log('ABABA ', result)
                    props.setCategories(result);
                })
            .catch((error) => {
                console.log(error)
            });
    }

    const getUsername = () => {
        // //////debugger
        console.log('THE ID IS ', props.userID)
        fetch("http://localhost:5000/tasks/getUsernameByID/"+props.userID)
            .then(res => res.json())
            .then(
                (result) => {
                    console.log('Username received: ', result);
                    setUsername(result['user_name']);
                })
            .catch((error) => {
                console.log(error)
            });
    }

    const postCategories = () => {
        // debugger
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
            cats[i].childNodes[1].style.visibility = 'hidden';
            cats[i].childNodes[2].style.visibility = 'hidden';
        }
    }

    const rgba2hex = (divs_color) => `#${divs_color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+\.{0,1}\d*))?\)$/).slice(1).map((n, ind) =>
        (ind === 3 ? Math.round(parseFloat(n) * 255) : parseFloat(n)).toString(16).padStart(2, '0').replace('NaN', '')).join('')}`

    const removeCatFromSchedule = (currentCat) => {
        // Iterating entire schedule
        let entire_schedule = document.querySelectorAll('[id^=cell_'+']')
        let i;
        for (i=0; i<props.timeRef.current.length; i++) {
            // Changing value of all slots with old cat classname to an empty class.
            if (props.timeRef.current[i] === currentCat){
                entire_schedule[i].className = 'empty_slot';
                entire_schedule[i].style.backgroundColor = 'transparent';
                props.timeRef.current[i] = -1;
            }
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
            new_category.innerText = props.categories[i]['category_name'];
            if (new_category.innerText === '')
                new_category.className = 'category_option_empty'
            new_category.style.backgroundColor = props.categories[i]['color'];
            // Adding category's edit button.
            let edit_cat = document.getElementById('edit_cat'+i);
            edit_cat = document.createElement('div');
            edit_cat.id = 'edit_cat' + i;
            edit_cat.className = 'edit_cat';
            edit_cat.title = 'Edit'
            new_category.appendChild(edit_cat)
            let new_cat_container= document.getElementById('adding_category_container');
            let category_accept_changes = document.getElementById('category_accept_changes');
            // Adding category's delete button.
            let remove_cat = document.getElementById('remove_cat'+i)
            remove_cat = document.createElement('div');
            remove_cat.id = 'remove_cat' + i;
            remove_cat.title = 'Remove';
            if (i >= 3)
                remove_cat.className = 'remove_cat';
            else
                remove_cat.className = 'remove_cat_grayed';
            new_category.appendChild(remove_cat);
            category_accept_changes.onclick = ()=> {
                props.setCategoryTrigger(!props.categoryTrigger)
                if (newCatref.current) {
                    // setCurrentCat(()=>getFirstEmptyCat())
                    setChangedCategories(prev=>[...prev, [getFirstEmptyCat(), 'add_'+document.getElementById('category_dialog').value]]);
                }
                // Do not save changes if title is empty.
                let dialog_length = document.getElementById('category_dialog').value.length
                if (dialog_length === 0 || dialog_length > 10 || catColorRef.current === 0) return;
                if (props.categories[currentCatRef.current]['category_name'] === '') {
                    let new_cat = document.getElementById('added_button_' + currentCatRef.current)
                    new_cat.style.opacity = '1';
                    new_cat.style.visibility = 'visible';
                    new_cat.style.display = 'block';
                    new_cat.style.marginLeft = '2px';
                }
                // ////////debugger
                new_cat_container.style.visibility = 'hidden';
                // Update category changes in both frontend and DB.
                setCategories();
            }
            // category_options[i].style.opacity = '1';
            // category_options[i].style.visibility = 'visible';
            // // category_options[i].style.display = 'block';
            // category_options[i].style.marginLeft = '2px';
            let category_decline_changes = document.getElementById('category_decline_changes');
            category_decline_changes.onclick = () => {unmarkRest(); new_cat_container.style.visibility = 'hidden';}
            edit_cat.onclick = () => {
                // Not a new category.
                setNewCat(false);
                setChangedCategories(prev=>[...prev, [i, '']]);
                unmarkRest();
                edit_cat.style.visibility = 'hidden'
                remove_cat.style.visibility = 'hidden'
                //Show existing (or empty) title value, when editing title and color of category.
                document.getElementById('category_dialog').value = props.categories[i]['category_name']
                // Show existing color.
                for (let j=1; j< 7; j++) {
                    let j_option = document.getElementById('new_category_option_'+j);
                    let j_option_color = document.defaultView.getComputedStyle(j_option, null)['backgroundColor'];
                    const j_converted_color = rgba2hex(j_option_color);
                    let current_color = props.categories[i]['color'];
                    // If rectangle color equals to category color, mark it.
                    if (j_converted_color.toUpperCase() === current_color.toUpperCase()) {
                        j_option.style.boxShadow = 'rgba(0, 0, 0, 1) 0 1px 4px';
                        setCategoryColor(j)
                        break;
                    }
                }
                // new_cat_container.style.marginLeft = '-200px'
                new_cat_container.style.visibility = 'visible'
            }
            if (i >= 3) {
                remove_cat.onclick = () => {
                    removeCatFromSchedule(i) //TODO - num to char (currencatref.current), iterate entire sched (todayref) and swap to empty_class(?)
                    setChangedCategories(prev=>[...prev, [i, 'remove']]);
                    let temp_cat = [...props.categories]
                    // Updating new value.
                    temp_cat[currentCatRef.current]['category_name'] = ''
                    temp_cat[currentCatRef.current]['color'] = ''
                    props.setCategories(temp_cat)
                    // Sending changed to DB.
                    postCategories()
                    props.handleCategoriesSubmission();
                    // Changing category value in frontend.
                    let new_category = document.getElementById('added_button_' + currentCatRef.current)
                    new_category.innerText = ''
                    new_category.style.backgroundColor = 'transparent'
                    new_category.style.display = 'none'
                    new_category.className = 'category_option_empty'
                    new_category.appendChild(edit_cat)
                    new_category.appendChild(remove_cat)
                    // document.getElementById('category_send_button').click();
                }
            }
            // Showing editing option and marking option.
            new_category.onclick =  (e) => {
                if (e.target.className.includes('remove_cat_grayed')) return
                document.getElementById('cap_msg').style.visibility = 'hidden';
                document.getElementById('cap_msg').style.opacity = '0';
                setCurrentCat(i);
                if (!e.target.id || (!e.target.id.startsWith('added_button') && !e.target.id.startsWith('remove_cat'))) return;
                props.setOption(i);
                if (edit_cat.style.visibility === 'visible') {
                    edit_cat.style.visibility = 'hidden';
                    remove_cat.style.visibility = 'hidden';
                }
                else {
                    hideRest()
                    edit_cat.style.visibility = 'visible';
                    remove_cat.style.visibility = 'visible';
                    new_cat_container.style.visibility = 'hidden';
                }
                let sched = document.getElementById('schedule_component')
                paintSlots(sched)
            }
            container.insertBefore(new_category, container.childNodes[container.childNodes.length-6]);
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
        props.setCategoryChanged(true);
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
        // debugger
        props.timeRef.current[event_slot] = ref
        props.setCategoryTypes(props.timeRef.current)
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
                node.ondrop = () => {console.log('DROP CAT!')}
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
        // changeCategoryButton()
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
            if (category_options[i].id.startsWith('added_button') && category_options[i].textContent === ''){
                category_options[i].style.display = 'none'
                continue
            }
            // // Collapsing categories.
            // if (category_button.className === 'category_button') {
            //     hideRest()
            //     category_options[i].style.opacity = '0';
            //     category_options[i].style.visibility = 'hidden';
            //     category_options[i].style.marginLeft = '-40px';
            // // Expanding categories.
            // } else {
            //     category_options[i].style.opacity = '1';
            //     category_options[i].style.visibility = 'visible';
            //     // category_options[i].style.display = 'block';
            //     category_options[i].style.marginLeft = '2px';
            // }
            category_options[i].style.opacity = '1';
            category_options[i].style.visibility = 'visible';
            // category_options[i].style.display = 'block';
            category_options[i].style.marginLeft = '2px';
        }

        // if (display_type === 'block') {
        //     paintSlots(sched)
        // }
        // else {
        //     unpaintSlots(sched)
        // }
        let node = sched.childNodes.item(0).childNodes.item(0).childNodes.item(0).childNodes.item(5).childNodes.item(7)
        if (node.ondragover && node.ondragover.name === 'allowDropCat')
            unpaintSlots(sched)
    }

    const findTask = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            alert('You typed "' + event.target.value + '" in the search box.')
        }
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
        container.insertBefore(new_category, container.childNodes[container.childNodes.length-6]);
        setTotalNewCat(totalNewCat+1)
    }

    const setCategories = () => {
        let edit_cat = document.getElementById('edit_cat'+currentCatRef.current)
        let remove_cat = document.getElementById('remove_cat'+currentCatRef.current)
        let colors = {1:'#FFE9E9', 2:'#FFFFE2', 3:'#E9EDFF', 4:'#E2FFFF', 5:'#FFF0D7', 6:'#E8FFE2'};
        let temp_cat = [...props.categories]
        // Updating new value.
        temp_cat[currentCatRef.current]['category_name'] = document.getElementById('category_dialog').value
        temp_cat[currentCatRef.current]['color'] = colors[catColorRef.current]
        props.setCategories(temp_cat)
        // Changing category value in frontend.
        let new_category = document.getElementById('added_button_' + currentCatRef.current)
        new_category.className = 'category_option'
        new_category.innerText = props.categories[currentCatRef.current]['category_name']
        new_category.style.backgroundColor = props.categories[currentCatRef.current]['color']
        new_category.appendChild(edit_cat)
        new_category.appendChild(remove_cat)
    }

    const getFirstEmptyCat = () => {
        for (let i=0; i<props.categories.length; i++) {
            if (props.categories[i].category_name === '')
                return i;
        }
        return null
    }

    const markSelf = (event) => {
        event.target.style.boxShadow = 'rgba(0, 0, 0, 1) 0 1px 4px';
    }

    const unmarkRest = () => {
        let colors = document.getElementsByClassName('category_colors');
        let i;
        for (i=0; i<colors.length; i++) {
            colors[i].style.boxShadow = '';
        }
    }

    const shiftCats = () => {
        let jsx_to_change = document.querySelectorAll('[id^=added_'+']')
        ////debugger
        let temp_categories = [...props.categories]
        let reached_empty_spot = false;
        // ////debugger
        for (let i=0; i<temp_categories.length-1; i++) {
            if (!reached_empty_spot && temp_categories[i]['category_name'].length !== 0) continue
            reached_empty_spot = true;
            temp_categories[i]['category_name'] = temp_categories[i+1]['category_name']
            temp_categories[i]['color'] = temp_categories[i+1]['color']
            // ////debugger
            // jsx_to_change[i].textContent = jsx_to_change[i+1].textContent
            // jsx_to_change[i].style.backgroundColor = jsx_to_change[i+1].style.backgroundColor
            //TODO change their jsx.
        }
        temp_categories[temp_categories.length-1]['category_name'] = ''
        props.setCategories(temp_categories);
    }

    // Updating to-do list categories after approving changes.
    const updateTodoListCategories = () => {
        let i, j;
        for (i=0; i<changedCategories.length; i++) {
            // let jsx_to_change = document.querySelectorAll('[id^=option_1234]')
            let jsx_to_change = document.querySelectorAll('[id^=option_' +changedCategories[i][0]+']')
            ////debugger
            // let cat_value  = document.getElementById('added_button_3');
            let cat_value  = document.getElementById('added_button_'+changedCategories[i][0]);
            // Editing new values.
            for (j=0; j<jsx_to_change.length; j++) {
                // removing element
                if (changedCategories[i][1] === 'remove') {
                    // ////debugger
                    // jsx_to_change[j].remove()
                    jsx_to_change[j].textContent = ''
                    jsx_to_change[j].style.display = 'none'
                // Adding element.
                } else if (changedCategories[i][1].startsWith('add')) { // Adding newly added categories
                    jsx_to_change[j].textContent = changedCategories[i][1].split('_')[1]
                    jsx_to_change[j].style.display = 'block'
                // Modifying element.
                } else {
                    jsx_to_change[j].textContent = cat_value.textContent;
                }
            }

        }
        // shiftCats();
    }

    const postNextWeek = (next_week) => {
        fetch('http://localhost:5000/tasks/PostNextWeek/'+ props.userID + '/' + next_week, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify()
        })
            .then((response) => {
                if (response.status === 201) {
                    console.log("User's tasks hes been sent successfully.");
                } else {
                    console.log("User's tasks hes been sent. HTTP request status code: " + response.status);
                }
                console.log('received info from postnextweek!!')
                console.log(response)
                console.log(response.text())
            })
            .catch((error) => {
                console.error("Error while submitting task: " + error.message);
            });
    }

    const scheduleForNextWeek = () => {
        props.setCategoryTrigger(false)
        if (window.confirm('Warning: planning schedule for next week will delete any previously generated schedule.')) {
            let is_next_week = true;
            if (localStorage.getItem('nextWeek').startsWith('t'))
                is_next_week = false;
            postNextWeek(is_next_week);
            // TODO set state changed, to enable submitting todo list.
            let date = new Date();
            let now = props.timeToSlot(date.getDay(), null, date.getHours(), date.getMinutes())
            if (localStorage.getItem('nextWeek').split('_')[0] === 't') {
                localStorage.setItem('nextWeek', 'f_' + now)
                document.getElementById('schedule_for_next_week_text').innerText = 'This Week'
                props.setScheduleMoment(now);
            } else {
                localStorage.setItem('nextWeek', 't_' + now)
                document.getElementById('schedule_for_next_week_text').innerText = 'Next Week'
                props.setScheduleMoment(0);
            }
            setTimeout(() => {
                props.setCategoryTrigger(true)
            }, 800)
        }
    }

    let sched = document.getElementById('schedule_component')

    let time_of_day = new Date().getHours()
    let greeting;
    if (time_of_day < 12) greeting = 'Good morning'
    else if (time_of_day < 18) greeting = 'Good afternoon'
    else greeting = 'Good evening'
    return (
        <div id='site_top' className='row flex-grow-0'>
            <img src={siteLogo} id='site_logo'/>
            <div id={'schedule_for_next_week'} onClick={()=>scheduleForNextWeek()}/>
            <div id={'schedule_for_next_week_text'}/>
            <div className={'spacing'}/>
            <div className='userContainer'>
                <div id='greeting'>{greeting}, {username}! 👋</div>
            </div>
            <div className='col-2' id='blank_col'/>
            <div data-toggle="tooltip" title="Exit paint mode" onClick={()=>{hideRest();showCategories()}} id='category_button' className='category_button'/>
            <div data-toggle="tooltip" title="Add category" id='add_category_button' onClick={(e)=>{
                hideRest()
                setNewCat(true);
                if (props.categories[5]['category_name'] !== '') {
                    document.getElementById('adding_category_container').style.visibility = 'hidden'
                    hideRest()
                    document.getElementById('cap_msg').style.visibility = 'visible';
                    document.getElementById('cap_msg').style.opacity = '1';
                    setTimeout(() => {
                        document.getElementById('cap_msg').style.visibility = 'hidden';
                        document.getElementById('cap_msg').style.opacity = '0';
                    }, 4000)
                    return
                }
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
            <div data-toggle="tooltip" title="Clear" id='clear_category_button' onClick={()=>{hideRest(); paintSlots(sched); props.setOption(-1)}} className='category_option'/>
            {/*TODO:show indicator of sending category.*/}
            <div data-toggle="tooltip" title="Save changes" id='category_send_button' onClick={()=>{
                hideRest()
                updateTodoListCategories();
                props.handleCategoriesSubmission();
                showCategories();
                props.setCategoryTrigger(true)
                postCategories()
            }
            } className='category_option'/>
            <div id='adding_category_container'>
                Title:
                <input id='category_dialog'/>
                Color:
                <span id='new_category_option_1' className='category_colors' onClick={(e)=> {
                    setCategoryColor(1)
                    unmarkRest()
                    markSelf(e)
                }}/>
                <span id='new_category_option_2' className='category_colors' onClick={(e)=> {
                    setCategoryColor(2)
                    unmarkRest()
                    markSelf(e)
                }}/>
                <span id='new_category_option_3' className='category_colors' onClick={(e)=> {
                    setCategoryColor(3)
                    unmarkRest()
                    markSelf(e)
                }}/>
                <span id='new_category_option_4' className='category_colors' onClick={(e)=> {
                    setCategoryColor(4)
                    unmarkRest()
                    markSelf(e)
                }}/>
                <span id='new_category_option_5' className='category_colors' onClick={(e)=> {
                    setCategoryColor(5)
                    unmarkRest()
                    markSelf(e)
                }}/>
                <span id='new_category_option_6' className='category_colors' onClick={(e)=> {
                    setCategoryColor(6)
                    unmarkRest()
                    markSelf(e)
                }}/>
                <span id='category_accept_changes'/>
                <span id='category_decline_changes'/>
            </div>
            <div id='cap_msg'>Cannot add more than 5 categories.</div>
            {/*<div className='col-4'>{login}</div>*/}
            <div id='logout' onClick={LogoutWrapper}>Log out</div>
        </div>
    );
}

export default SiteTop;