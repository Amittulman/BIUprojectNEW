import React, { useState } from 'react';
import {Link} from "react-router-dom";
import './Menu.css'

function Button() {
    const [isActive, setActive] = useState("false");
    const handleToggle = () => {
        setActive(!isActive);
    };
    let bar = ['bar'];
    return (
    <div id='parentMenu'>
        <div className={isActive ? 'menuContainer' : 'menuContainer'} onClick={handleToggle}>
            <div className={isActive ? bar : [bar, 'change1'].join(' ')}/>
            <div className={isActive ? bar : [bar, 'change2'].join(' ')}/>
            <div className={isActive ? bar : [bar, 'change3'].join(' ')}/>
        </div>
        <Link to='/' className={isActive ? 'closedMenu' : 'openedMenu2'}>TO-DO</Link>
        <Link to='/schedule' className={isActive ? 'closedMenu' : 'openedMenu1'}>Schedule</Link>
    </div>
    );
}
export default Button;