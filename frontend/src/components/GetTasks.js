import React from 'react';

class GetTasks extends React.Component {
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

    retrieveTasks = (event) => {
        const { error, isLoaded, items } = this.state;
        let message = ''
        if (error) {
            message = "Error: " + error;
        } else if (!isLoaded) {
            message = "Waiting for task to be received...";
        } else {
            message = "Data received: " + items;
        }
        return message;
    }

    render() {
        let message = this.retrieveTasks();
        return (
            <div>
                <button onClick={this.dataButtonHandler}>My Tasks</button>
                <div>{message}</div>
            </div>
        );
    }
}
export default GetTasks;
