import Todo from "./Todo";
import Schedule from "./Schedule";
import {Route, Switch} from "react-router";
import '../components/App.css';

export default function App() {
    return (
        <div className="App">
            <Switch>
                <Route exact path='/' component={Todo}/>
                <Route path='/schedule' component={Schedule}/>
            </Switch>
        </div>
    )
}