import React, {Component} from 'react';

class Task extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: []
        };
    }

    dataButtonHandler = (event) => {
        fetch("http://localhost:5000/gethello")
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        isLoaded: true,
                        items: JSON.stringify(result)
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }


    render() {
        const { error, isLoaded, items } = this.state;
        let message = ''
        if (error) {
            message = "Error: " + error;
        } else if (!isLoaded) {
            message = "Waiting for task to be received...";
        } else {
            message = "Data received: " + items;
        }
        return (
            <div>
                <button onClick={this.dataButtonHandler}>Get data from server</button>
                <div>{message}</div>
            </div>
        );
    }
}
export default Task;
