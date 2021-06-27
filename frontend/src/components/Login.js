import './Login.css'
import React, {useState, useEffect, useRef} from 'react'
import { Switch, Route, Redirect, withRouter } from 'react-router';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { TransitionGroup, CSSTransition} from "react-transition-group";
import siteLogo from '../images/BEEZEELOGO.png';

// import 'bcrypt'
const bcryptjs = require('bcryptjs');

const Login = (props) => {
    const location = useLocation();
    const [loginUserClicked, setLoginUserClicked] = useState(false);
    const [loginPassClicked, setLoginPassClicked] = useState(false);
    const [rePassClicked, setRePassClicked] = useState(false);
    // const [emailClicked, setEmailClicked] = useState(false);
    const [signUpUserClicked, setSignUpUserClicked] = useState(false);
    const [signUpPassClicked, setSignUpPassClicked] = useState(false);
    const [loginAnswer, setLoginAnswer] = useState();
    const [signUpAnswer, setSignUpAnswer] = useState();
    const [loggedIn, setLoggedIn] = useState(false);
    const history = useHistory();
    const login_userNode = useRef();
    const login_passNode = useRef();
    const signup_userNode = useRef();
    const signup_passNode = useRef();
    const signup_rePassNode = useRef();
    // const signup_emailNode = useRef();


    useEffect(() => {
        let date = new Date();
        // let slot = props.timeToSlot(date.getDay(), null, date.getHours(), date.getMinutes())
        // props.setScheduleMoment(slot);
        // localStorage.setItem('nextWeek', 'f')
        // if (localStorage.getItem('nextWeek') === null || localStorage.getItem('nextWeek') === 'f') {
        //     let date = new Date();
        //     let slot = props.timeToSlot(date.getDay(), null, date.getHours(), date.getMinutes())
        //     props.setScheduleMoment(slot);
        //     localStorage.setItem('nextWeek', 'f')
        // }
        // else {
        //     props.setScheduleMoment(0);
        // }
        if (localStorage.getItem('rememberMe') === 'true' && localStorage.getItem('userID') > 0) {
            // console.log('YUPS')
            history.push('/mainPage')
        }
    }, [])

    useEffect(() => {
        // console.log('login user cliced: ', loginUserClicked)
    }, [loginUserClicked])


    const loginAppearAnimation = [[
        { 'opacity': 0, 'visibility': 'none'},
        { 'opacity': 1, 'visibility': 'visible'}
    ], {duration: 350, fill: 'forwards', easing: 'ease-in'}];

    useEffect(() => {
        // add when mounted
        document.addEventListener("mousedown", highlightTextBox);
        // return function to be called when unmounted
        return () => {
            document.removeEventListener("mousedown", highlightTextBox);
        };
    }, [location]);

    // When login value changes (after pressing 'log in' with credentials).
    useEffect(() => {
        console.log('LOGIN ANSWER ', loginAnswer)
        let username = document.getElementById('username')
        let password = document.getElementById('password')
        if (loginAnswer === undefined) return
        let text_to_client;
        //////debugger
        switch(loginAnswer) {
            case -1:
                text_to_client = 'Wrong username.';
                removeInputError(password)
                showInputError(username)
                break;
            case -2:
                text_to_client = 'Wrong password';
                removeInputError(username)
                showInputError(password)
                break;
            default:
                removeInputError(username);
                removeInputError(password);
                text_to_client = 'Success!';
                props.setUserID(loginAnswer);
                props.setRememberMe(document.getElementById('remember_me_input').checked);
                localStorage.setItem('userID', loginAnswer);
                // console.log('this will be added: ', document.getElementById('remember_me_input').checked)
                localStorage.setItem('rememberMe', document.getElementById('remember_me_input').checked === true)

                let date = new Date();
                let x = parseInt(props.timeToSlot(date.getDay(), null, date.getHours(), date.getMinutes()))
                let y = parseInt(localStorage.getItem('nextWeek').split('_')[1])

                let slot = props.timeToSlot(date.getDay(), null, date.getHours(), date.getMinutes())
                if (parseInt(props.timeToSlot(date.getDay(), null, date.getHours(), date.getMinutes())) < parseInt(localStorage.getItem('nextWeek').split('_')[1])) {
                    props.setScheduleMoment(slot);
                }
                if (localStorage.getItem('nextWeek').split('_')[0] === 't') {

                    props.setScheduleMoment(0);
                } else {
                    props.setScheduleMoment(slot);
                }

                break;
        }
        // console.log(text_to_client)
    },[loginAnswer])

    //When sign up value changes
    useEffect(() => {
        if (signUpAnswer === undefined) return
        let text_to_client;
        let username = document.getElementById('username')
        switch(signUpAnswer) {
            case -1:
                text_to_client = 'Username already taken.';
                markAsError(true, username)
                showInputError(username)
                break;
            case -2:
                text_to_client = 'An error occurred. Please try again late.';
                removeInputError(username)
                break;
            default:
                removeInputError(username)
                // TODO change f to storage value check
                let date = new Date();
                let now = props.timeToSlot(date.getDay(), null, date.getHours(), date.getMinutes())
                localStorage.setItem('nextWeek', 'f_'+now);
                text_to_client = 'Signed up successfully.';
                props.setUserID(signUpAnswer);
                break;
        }
        // console.log(text_to_client)
    }, [signUpAnswer])

    const unmarkLoginFields = () => {
        login_passNode.current.childNodes[1].classList.remove('input_clicked')
        login_userNode.current.childNodes[1].classList.remove('input_clicked')
        setLoginPassClicked(false)
        setLoginUserClicked(false)
    }

    const unmarkSignUpFields = () => {
        // signup_emailNode.current.childNodes[1].classList.remove('input_clicked')
        signup_rePassNode.current.childNodes[1].classList.remove('input_clicked')
        signup_passNode.current.childNodes[1].classList.remove('input_clicked')
        signup_userNode.current.childNodes[1].classList.remove('input_clicked')
        setSignUpPassClicked(false)
        setSignUpUserClicked(false)
        // setEmailClicked(false)
        setRePassClicked(false)
    }

    const highlightTextBox = (e) => {
        if(!signup_passNode.current && !login_passNode.current) return
        // if (e.target.className !== 'signing_up' && e.target.className !== 'log_in') return
        if (!!login_userNode.current)
            unmarkLoginFields()
        if (!!signup_rePassNode.current)
            unmarkSignUpFields()
        switch (e.target) {
            case login_userNode.current && login_userNode.current.childNodes[3]:
                login_userNode.current.childNodes[1].classList.add('input_clicked')
                setLoginUserClicked(true);
                break;
            case login_passNode.current && login_passNode.current.childNodes[3]:
                login_passNode.current.childNodes[1].classList.add('input_clicked')
                setLoginPassClicked(true);
                break;
            case signup_userNode.current && signup_userNode.current.childNodes[3]:
                signup_userNode.current.childNodes[1].classList.add('input_clicked')
                setSignUpUserClicked(true);
                break;
            case signup_passNode.current && signup_passNode.current.childNodes[3]:
                signup_passNode.current.childNodes[1].classList.add('input_clicked')
                setSignUpPassClicked(true);
                break;
            case signup_rePassNode.current && signup_rePassNode.current.childNodes[3]:
                signup_rePassNode.current.childNodes[1].classList.add('input_clicked')
                setRePassClicked(true);
                break;
            // case signup_emailNode.current && signup_emailNode.current.childNodes[3]:
            //     signup_emailNode.current.childNodes[1].classList.add('input_clicked')
            //     setEmailClicked(true);
            //     break;
            default:
                break;
        }
    }

    const checkLoginInputAndSend = () => {
        let input_indicator = true
        let username = document.getElementById('username_text')
        let password = document.getElementById('password_text')
        if (password.value.length === 0) {
            // mark as error
            markAsError(true, password, 'No password was entered.')
            input_indicator = false
        } else {
            // unmark as error
            markAsError(false, password)
        }
        //validating username
        if (username.value.length > 8 || username.value.length < 4) {
            markAsError(true, username)
            input_indicator = false
        } else {
            markAsError(false, username)
        }
        // If indicator is true, some fields are not valid, so do not sign up with given data.
        if (input_indicator) {
            let apiParams = {"user_name":username.value, "user_pass": password.value}
            APICall('checkusercredentials', apiParams)
        }
    }

    //Update red astrix next to erroneous input.
    const markAsError = (error, element, msg='') => {
        let name;
        let name2;
        // Building the appropriate div name, to find the required element (for the pop-up message).
        if (element.id.split('_').slice(0,-1).join('_').toString() !== '') {
            name = 'err_' + element.id.split('_').slice(0, -1).join('_').toString()
            if (location.pathname === '/signup')
                name2 = element.id.split('_').slice(0, -1).join('_').toString() + '_input_error_signup'
        }
        else {
            name = 'err_' + element.id
            if (location.pathname === '/signup')
                name2 = element.id + '_input_error_signup'
        }
        if (error) {
            // //debugger
            document.getElementById(name).className = 'error_sign'
            if (location.pathname === '/signup') {
                document.getElementById(name2).textContent = msg
            }
            // document.getElementById(name).textContent = 'msgmsg'
        } else {
            document.getElementById(name).className = 'no_error_sign'
            if (location.pathname === '/signup')
                document.getElementById(name2).textContent = msg
        }
    }

    const checkSignUpInputAndSend = () => {
        let input_indicator = true
        let username = document.getElementById('username_text')
        let password = document.getElementById('password_text')
        let confirmPassword = document.getElementById('confirm_password_text')
        // //////debugger
        // let email = document.getElementById('email_text')
        // Removing all previous error tooltips.
        removeInputError(document.getElementById('username'))
        removeInputError(document.getElementById('password'))
        removeInputError(document.getElementById('confirm_password'))
        // removeInputError(document.getElementById('email'))
        if (password.value.length === 0) {
            // mark as error
            markAsError(true, password, 'No password was entered.')
            showInputError(document.getElementById('password'))
            input_indicator = false
        } else {
            // unmark as error
            markAsError(false, password)
        }
        // matching passwords
        if (password.value !== confirmPassword.value) {
            // mark as error
            markAsError(true, confirmPassword, 'passwords do not match.')
            showInputError(document.getElementById('confirm_password'))
            input_indicator = false
        } else {
            // unmark as error
            markAsError(false, confirmPassword)
        }
        //validating username
        if (username.value.length > 12 || username.value.length < 3) {
            // //////debugger
            markAsError(true, username, 'Please use 4-8 characters')
            let user = document.getElementById('username')
            showInputError(user)
            input_indicator = false
        } else {
            markAsError(false, username, 'Username is already taken.')
        }
        // valid email
        // if (!email.value.includes('@')) {
        //     markAsError(true, email)
        //     showInputError(document.getElementById('email'))
        //     input_indicator = false
        // } else {
        //     markAsError(false, email)
        // }

        // If indicator is true, some fields are not valid, so do not sign up with given data.
        if (input_indicator) {
            const saltRounds= 10
            let pass = '123'
            bcryptjs.hash(password.value, saltRounds, function (err, hash) {
                let apiParams = {"user_name":username.value, "user_pass": hash}
                APICall('postnewuser', apiParams)
            });

        }
    }

    const APICall = (requestName, apiParams) => {
        fetch('http://localhost:5000/tasks/'+requestName+'/', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(apiParams)
        })
            .then(res=>res.json())
            .then((response) => {
                if (response.status !== 201) {
                    console.log('response: ', response)
                    // console.log('SUCCESSFULL LOGIN!')
                    //////debugger
                    // If successful logging in
                        if (requestName === 'checkusercredentials') {
                            // console.log('INSIDE CHECK USER CREDENTIALS ', response['user_id'])
                            // ////debugger
                        bcryptjs.compare(apiParams['user_pass'], response['user_pass'], function(err, result) {
                            if (result) {
                                console.log('response after success: ', response['user_id'])
                                    setLoggedIn(true)
                                    setLoginAnswer(undefined)
                                    setLoginAnswer(response['user_id'])
                                    history.push('/mainPage')
                            } else {
                                setLoginAnswer(undefined)
                                setLoginAnswer(-2)
                            }
                        });
                        // if (response['pass'] > 0) {
                        //     setLoggedIn(true)
                        //     history.push('/mainPage')
                        // }
                        // setLoginAnswer(undefined)
                        // setLoginAnswer(response)
                    // If successful signing up.
                    } else {
                            if (response === -1) {
                                let username = document.getElementById('username')
                                markAsError(true, username, 'User already taken.')
                                showInputError(username)

                                return;
                            }
                        // ////debugger
                        setSignUpAnswer(undefined)
                        setSignUpAnswer(response['user_id'])
                        history.push('/')
                        // if (response['user_id'] > 0)
                        //     {}
                    }
                    return response;
                } else {
                    console.log("User's tasks hes been sent. HTTP request status code: " + response.status);
                }
            })
            .catch((error) => {
                console.error("Error while submitting task: " + error.message);
            });
    }

    const showInputError = (e) => {
        // e.target.parentNode.childNodes[2].classList.replace('hidden_input_error', 'input_error')
        if (e.target !== undefined)
            e.target.parentNode.childNodes[2].classList.replace('hidden_input_error', 'input_error')
        else
            e.childNodes[2].classList.replace('hidden_input_error', 'input_error')
    }

    const removeInputError = (e) => {
        // console.log(e.target.parentNode.childNodes[2])
        if (e.target !== undefined)
            setTimeout(() => {
                e.target.parentNode.childNodes[2].classList.replace('input_error', 'hidden_input_error')
            }, 300)
        else
            e.childNodes[2].classList.replace('input_error', 'hidden_input_error')
    }

    const LoginPage = () =>
    {
        return(
            <form className='login_container' id='login_container' >
                <img src={siteLogo} id='login_title'/>
                <div className={'spacing'}/>
                <div className='login_subtitle'>Hello, please log in.</div>
                <div id='username' ref={login_userNode} className={loginUserClicked?'textbox_title_clicked':'textbox_title'}>Username<span id='err_username' className='no_error_sign'>*</span><div className='hidden_input_error' id='username_input_error_login'/><input id='username_text' maxLength='10' className={loginUserClicked?'input_clicked':'input'} type='text'/></div>
                <div id='password' ref={login_passNode} className={loginPassClicked?'textbox_title_clicked':'textbox_title'}>Password<span  id='err_password' className='no_error_sign'>*</span><div className='hidden_input_error' id='password_input_error_login'/><input id='password_text' maxLength='12' className={loginPassClicked?'input_clicked':'input'} type='password'/></div>
                <div id='remember_me_container'>
                    <input type="checkbox" id="remember_me_input" defaultValue={props.rememberMe}/>
                    <label className='remember_me' id="remember_me_label" htmlFor="rememberMe">Remember me</label>
                </div>
                <div className='log_in' onClick={()=> {
                    unmarkLoginFields()
                    checkLoginInputAndSend()
                }}>Log In</div>
                <Link to='./signup' className='sign_up'>Sign Up</Link>
                <div className='forgot_password'/>
            </form>
        );
    }

    const SignUpPage = () =>
    {
        return(
            <div className='signup_container' id='signup_container'>
                <img src={siteLogo} id='login_title'/>
                <div className={'spacing_signup'}/>
                {/*<div className='login_subtitle'>Please sign up.</div>*/}
                <div ref={signup_userNode} id='username' className={signUpUserClicked?'textbox_title_clicked':'textbox_title'}>Username<span id='err_username' className='no_error_sign'>*</span><div className='hidden_input_error' id='username_input_error_signup'/><input id='username_text' maxLength='10' className={signUpUserClicked?'input_clicked':'input'} type='text'/></div>
                <div ref={signup_passNode} id='password' className={signUpPassClicked?'textbox_title_clicked':'textbox_title'}>Password<span id='err_password' className='no_error_sign'>*</span><div className='hidden_input_error' id='password_input_error_signup'/><input id='password_text' maxLength='12' className={signUpPassClicked?'input_clicked':'input'} type='password'/></div>
                <div ref={signup_rePassNode} id='confirm_password' className={rePassClicked?'textbox_title_clicked':'textbox_title'}>Confirm Password<span id='err_confirm_password' className='no_error_sign'>*</span><div className='hidden_input_error' id='confirm_password_input_error_signup'/><input id='confirm_password_text' maxLength='12' type='password'/></div>
                {/*<div ref={signup_emailNode} id='email' className={emailClicked?'textbox_title_clicked':'textbox_title'}>Email<span id='err_email' className='no_error_sign'>*</span><div className='hidden_input_error' id='email_input_error_signup'/><input id='email_text' className={emailClicked?'input_clicked':'input'} type='email'/></div>*/}
                <input className='signing_up' onClick={()=> {
                    unmarkSignUpFields()
                    checkSignUpInputAndSend();
                }} type='submit' value='Sign Up' />
                <Link to='/' className='back_to_login'>Log in</Link>
            </div>
        );
    }

    return (
        <div className='login-route'>
            <TransitionGroup>
                <CSSTransition
                    timeout={350}
                    classNames='fade'
                    key={location.key}
                    unmountOnExit
                >
                <Switch location={location}>
                    <Route exact path='/' location={location} render={LoginPage}/>
                    <Route path='/signup' location={location} render={SignUpPage}/>
                </Switch>
                </CSSTransition>
            </TransitionGroup>
        </div>
    );
}


export default withRouter(Login);