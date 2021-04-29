import React from 'react';
import '../components/Schedule.css';
import Menu from "./Menu";


function Table() {
    getSchedule();
    let title = <title id='title'>Your schedule for the week</title>;
    let search_input = <input onKeyPress={findTask} id='input' type='text' placeholder='Search Task...'/>;
    let search = <div>{search_input}</div>
    let day = ['Time', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let jsx= [];
    let task = {day: '', time: '', }
    for (let i=0; i<8; i++) {
        let content = [];
        let hour = 8;
        let minute = 0;
        if (day[i] === 'Time') {
            for (let j=0; j<32; j++) {
                hour = Math.floor(8+j/2);
                minute = 30 * (j%2);
                if (hour < 10) hour = '0' + hour
                if (minute === 0) minute = '00'
                content.push(<td>{hour}:{minute}</td>);
            }
        } else {
            for (let j=0; j<32; j++) {
                let a = '';
                if (j === 1) a = 'abc';
                content.push(<td id={'cell_'+i+j} draggable='true' onDragStart={dragStart} onDrop={drop} onDragOver={allowDrop} onDragLeave={leaveDropArea}>{a}</td>);
            }
        }
        jsx.push(<tr><th>{day[i]}</th>{content}</tr>);
    }
    let table = <table>{jsx}</table>
    return (<div><Menu/>{search}{table}</div>);
}

function getSchedule(event) {
    console.log('getSchedule has been called.');
    fetch("http://localhost:5000/getSchedule")
        .then(res => res.json())
        .then(
            (result) => {
                if (result['statusCode'] === 500) throw new Error('Internal server error.');
            })
        .catch((error) => {
            console.log(error)
        });
}

function findTask(event) {
    if (event.key === 'Enter') {
        event.preventDefault()
        alert('You typed "' + event.target.value + '" in the search box.')
    }
}

function dragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
}

function allowDrop(event) {
    event.preventDefault();
    event.target.style.boxShadow = 'rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px';
    event.target.style.transition = 'box-shadow .2s linear';
}

function leaveDropArea(event) {
    event.preventDefault();
    event.target.style.boxShadow = 'none';
    event.target.style.transition = 'box-shadow .2s linear';
}

function drop(event) {
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