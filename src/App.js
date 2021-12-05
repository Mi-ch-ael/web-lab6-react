import {Component} from "react";
import './App.css';
import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:4080' , {transports: ['websocket']});

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {username: "Admin"}
        this.onSelect = this.onSelect.bind(this);
        this.onClick = this.onClick.bind(this);

        socket.on("test", (data) => {
            console.debug(data);
        });
        socket.on("brokers", (data) => {
            if(document.getElementById('user').children.length !== 1) return;
            const select = document.getElementById('user');
            for(const broker of data) {
                const option = document.createElement('option');
                option.value = `${broker.firstName}|${broker.lastName}`
                option.innerHTML = `${broker.firstName} ${broker.lastName}`;
                select.appendChild(option);
            }
        });
    }

    onSelect(e) {
        console.debug(e.target.value);
        this.state.username = e.target.value;
    }

    onClick(e) {
        console.debug(e.target);
        if(this.state.username === "Admin") {
            window.location.pathname = "/admin";
            return;
        }
        window.location.pathname = `/user/${this.state.username.split("|")[1]}`;
    }

    render() {
        return (
            <div>
                <div className={"w3-container w3-center"}>
                    <h1>Welcome to stock market!</h1>
                </div>
                <div className={"w3-container w3-center"}>
                    Log in as:<br></br>
                    <select className={"button-like"} id={"user"} onChange={this.onSelect}>
                        <option value={"Admin"}>Admin</option>
                    </select><br/>
                    <button className={"content-standalone"} onClick={this.onClick}>Log in</button>
                </div>
            </div>
        );
    }
}

export default App;
