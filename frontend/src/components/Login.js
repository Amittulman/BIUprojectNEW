import './Login.css'
import React, {useState, useEffect, useRef} from 'react'
import { Switch, Route, Redirect, withRouter } from 'react-router';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { TransitionGroup, CSSTransition} from "react-transition-group";

const Login = (props) => {
    const location = useLocation();
    const [loginUserClicked, setLoginUserClicked] = useState(false);
    const [loginPassClicked, setLoginPassClicked] = useState(false);
    const [rePassClicked, setRePassClicked] = useState(false);
    const [emailClicked, setEmailClicked] = useState(false);
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
    const signup_emailNode = useRef();

    useEffect(() => {
        console.log('should have reset userid')
        // props.setUserID(undefined)
    }, [])

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
        if (loginAnswer === undefined) return
        let text_to_client;
        switch(loginAnswer) {
            case -1:
                text_to_client = 'Wrong username.';
                break;
            case -2:
                text_to_client = 'Wrong password';
                break;
            default:
                text_to_client = 'Success!';
                props.setUserID(loginAnswer);
                // TODO - move to main page.
                break;
        }
        console.log(text_to_client)
    },[loginAnswer])

    //When sign up value changes
    useEffect(() => {
        if (signUpAnswer === undefined) return
        let text_to_client;
        switch(signUpAnswer) {
            case -1:
                text_to_client = 'Username already taken.';
                break;
            case -2:
                text_to_client = 'An error occurred. Please try again late.';
                break;
            default:
                text_to_client = 'Signed up successfully.';
                props.setUserID(signUpAnswer);
                break;
        }
        console.log(text_to_client)
    }, [signUpAnswer])

    const unmarkLoginFields = () => {
        login_passNode.current.childNodes[1].classList.remove('input_clicked')
        login_userNode.current.childNodes[1].classList.remove('input_clicked')
        setLoginPassClicked(false)
        setLoginUserClicked(false)
    }

    const unmarkSignUpFields = () => {
        signup_emailNode.current.childNodes[1].classList.remove('input_clicked')
        signup_rePassNode.current.childNodes[1].classList.remove('input_clicked')
        signup_passNode.current.childNodes[1].classList.remove('input_clicked')
        signup_userNode.current.childNodes[1].classList.remove('input_clicked')
        setSignUpPassClicked(false)
        setSignUpUserClicked(false)
        setEmailClicked(false)
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
            case login_userNode.current && login_userNode.current.childNodes[2]:
                login_userNode.current.childNodes[1].classList.add('input_clicked')
                setLoginUserClicked(true);
                break;
            case login_passNode.current && login_passNode.current.childNodes[2]:
                login_passNode.current.childNodes[1].classList.add('input_clicked')
                setLoginPassClicked(true);
                break;
            case signup_userNode.current && signup_userNode.current.childNodes[2]:
                signup_userNode.current.childNodes[1].classList.add('input_clicked')
                setSignUpUserClicked(true);
                break;
            case signup_passNode.current && signup_passNode.current.childNodes[2]:
                signup_passNode.current.childNodes[1].classList.add('input_clicked')
                setSignUpPassClicked(true);
                break;
            case signup_rePassNode.current && signup_rePassNode.current.childNodes[2]:
                signup_rePassNode.current.childNodes[1].classList.add('input_clicked')
                setRePassClicked(true);
                break;
            case signup_emailNode.current && signup_emailNode.current.childNodes[2]:
                signup_emailNode.current.childNodes[1].classList.add('input_clicked')
                setEmailClicked(true);
                break;
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
            markAsError(true, password)
            input_indicator = false
        } else {
            // unmark as error
            markAsError(false, password)
        }
        //validating username
        if (username.value.length > 12 || username.value.length < 4) {
            markAsError(true, username)
            input_indicator = false
        } else {
            markAsError(false, username)
        }
        // If indicator is true, some fields are not valid, so do not sign up with given data.
        if (!input_indicator) {
            // TODO - show indication on screen, do not send anything to DB.
        } else {
            let apiParams = {"user_name":username.value, "user_pass": password.value}
            APICall('checkusercredentials', apiParams)
        }
    }

    //Update red astrix next to erroneous input.
    const markAsError = (error, element) => {
        let name = 'err_' + element.id.split('_').slice(0,-1).join('_').toString()
        if (error) {
            document.getElementById(name).className = 'error_sign'
        } else {
            document.getElementById(name).className = 'no_error_sign'
        }
    }

    const checkSignUpInputAndSend = () => {
        let input_indicator = true
        let username = document.getElementById('username_text')
        let password = document.getElementById('password_text')
        let confirmPassword = document.getElementById('confirm_password_text')
        let email = document.getElementById('email_text')
        if (password.value.length === 0) {
            // mark as error
            markAsError(true, password)
            input_indicator = false
        } else {
            // unmark as error
            markAsError(false, password)
        }
        // matching passwords
        if (password.value !== confirmPassword.value || confirmPassword.value.length === 0) {
            // mark as error
            markAsError(true, confirmPassword)
            input_indicator = false
        } else {
            // unmark as error
            markAsError(false, confirmPassword)
        }
        //validating username
        if (username.value.length > 12 || username.value.length < 3) {
            markAsError(true, username)
            input_indicator = false
        } else {
            markAsError(false, username)
        }
        // valid email
        if (!email.value.includes('@')) {
            markAsError(true, email)
            input_indicator = false
        } else {
            markAsError(false, email)
        }
        // If indicator is true, some fields are not valid, so do not sign up with given data.
        if (!input_indicator) {
            // TODO - show indication on screen, do not send anything to DB.
        } else {
            let apiParams = {"user_name":username.value, "user_pass": password.value}
            APICall('postnewuser', apiParams)
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
                    console.log("User's tasks hes been sent successfully.");
                    if (requestName === 'checkusercredentials') {
                        setLoginAnswer(undefined)
                        setLoginAnswer(response)
                        setLoggedIn(true)
                        history.push('/mainPage')
                    } else {
                        setSignUpAnswer(undefined)
                        setSignUpAnswer(response)
                        history.push('/')
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
        // console.log(e.target.parentNode.childNodes[2])
        e.target.parentNode.childNodes[2].classList.replace('hidden_input_error', 'input_error')
    }

    const removeInputError = (e) => {
        // console.log(e.target.parentNode.childNodes[2])
        setTimeout(()=>{
            e.target.parentNode.childNodes[2].classList.replace('input_error', 'hidden_input_error')
        },200)
    }

    const LoginPage = () =>
    {
        return(
            <form className='login_container'>
                <div className='login_title'>BeeZee</div>
                <div className='login_subtitle'>Hello, please log in.</div>
                <div id='username' ref={login_userNode} className={loginUserClicked?'textbox_title_clicked':'textbox_title'}>Username<span onMouseEnter={(e)=>showInputError(e)} onMouseLeave={(e)=>removeInputError(e)} id='err_username' className='no_error_sign'>*</span><div className='hidden_input_error' id='username_input_error_login'/><input id='username_text' maxLength='10' className={loginUserClicked?'input_clicked':'input'} type='text'/></div>
                <div id='password' ref={login_passNode} className={loginPassClicked?'textbox_title_clicked':'textbox_title'}>Password<span onMouseEnter={(e)=>showInputError(e)} onMouseLeave={(e)=>removeInputError(e)} id='err_password' className='no_error_sign'>*</span><div className='hidden_input_error' id='password_input_error_login'/><input id='password_text' maxLength='12' className={loginPassClicked?'input_clicked':'input'} type='password'/></div>
                <div className='log_in' onClick={()=> {
                    unmarkLoginFields()
                    checkLoginInputAndSend()
                }}>Log In</div>
                {/*<div className='d-flex justify-content-between remember_me_signup_container'>*/}
                {/*    <div>*/}
                {/*        <input type="checkbox" id="rememberMe" name="rememberMe" value="no"/>*/}
                {/*        <label className='remember_me' htmlFor="rememberMe">Remember me</label>*/}
                {/*    </div>*/}
                {/*    <div className='log_in' onClick={()=> {*/}
                {/*        unmarkLoginFields()*/}
                {/*        checkLoginInputAndSend()*/}
                {/*    }}>Log In</div>*/}
                {/*</div>*/}
                <Link to='./signup' className='sign_up'>Sign Up</Link>
                <div className='forgot_password'>Forgot password?</div>
            </form>
        );
    }

    const disappear = (e) => {
        e.target.parentNode.className = 'login_container_gone'
    }

    const SignUpPage = () =>
    {
        return(
            <div className='login_container'>
                <div className='login_title'>BeeZee</div>
                {/*<div className='login_subtitle'>Please sign up.</div>*/}
                <div ref={signup_userNode} id='username' className={signUpUserClicked?'textbox_title_clicked':'textbox_title'}>Username<span onMouseEnter={(e)=>showInputError(e)} onMouseLeave={(e)=>removeInputError(e)} id='err_username' className='no_error_sign'>*</span><div className='hidden_input_error' id='username_input_error_signup'/><input id='username_text' maxLength='10' className={signUpUserClicked?'input_clicked':'input'} type='text'/></div>
                <div ref={signup_passNode} id='password' className={signUpPassClicked?'textbox_title_clicked':'textbox_title'}>Password<span onMouseEnter={(e)=>showInputError(e)} onMouseLeave={(e)=>removeInputError(e)} id='err_password' className='no_error_sign'>*</span><div className='hidden_input_error' id='password_input_error_signup'/><input id='password_text' maxLength='12' className={signUpPassClicked?'input_clicked':'input'} type='password'/></div>
                <div ref={signup_rePassNode} id='confirm_password' className={rePassClicked?'textbox_title_clicked':'textbox_title'}>Confirm Password<span onMouseEnter={(e)=>showInputError(e)} onMouseLeave={(e)=>removeInputError(e)} id='err_confirm_password' className='no_error_sign'>*</span><div className='hidden_input_error' id='confirm_password_input_error_signup'/><input id='confirm_password_text' maxLength='12' type='password'/></div>
                <div ref={signup_emailNode} id='email' className={emailClicked?'textbox_title_clicked':'textbox_title'}>Email<span onMouseEnter={(e)=>showInputError(e)} onMouseLeave={(e)=>removeInputError(e)} id='err_email' className='no_error_sign'>*</span><div className='hidden_input_error' id='email_input_error_signup'/><input id='email_text' className={emailClicked?'input_clicked':'input'} type='email'/></div>
                <input className='signing_up' onClick={()=> {
                    unmarkSignUpFields()
                    checkSignUpInputAndSend();
                }} type='submit' value='Sign Up' />
                <Link to='/' className='forgot_password'>Log in</Link>
            </div>
        );
    }

    const AppWrapper = (e) => {
        // console.log('ABC ', e.history.location.pathname)
        if (!props.userID > 0)
            return (LoginPage());
        return (<Redirect to='/mainPage' />)
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