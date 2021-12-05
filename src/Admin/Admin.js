import './Admin.css';
import React, {Component} from "react";
import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:4080' , {transports: ['websocket']});

class Admin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            brokers: null,
            stocks: null
        };
        this.onStart = this.onStart.bind(this);
        socket.on("brokers", (brokers) => {
            if (this.state.brokers === null) this.setState(
                {brokers: brokers, stocks: this.state.stocks}
            );
            console.debug(this.state);
            if (document.getElementById('brokers-list').children.length > 0) {
                /*const list = document.getElementById('brokers-list').children;
                for(let i = 0; i < list.length; ++i) {
                    console.debug(list[i].innerHTML, list[i].innerText);
                }*/
                for(let i = 0; i < brokers.length; ++i) {
                    document.getElementById(`broker#${i}`).innerHTML = brokers[i].money;
                }
                return;
            }
            for (const broker of brokers) {
                const li = document.createElement("li");
                li.innerHTML = `${broker.firstName} ${broker.lastName}, ${broker.country}:
                <b id="broker#${brokers.indexOf(broker)}">${broker.money}</b> coins, stocks:`;
                document.getElementById('brokers-list').appendChild(li);
            }
        });

        socket.on("stocksToBrokers", (stocksToBrokers) => {
            if (document.getElementById('brokers-list').children.length === 0) return;
            if(document.getElementById('brokers-list').children[0].children.length > 1) {
                /*for(const elem of document.getElementById('brokers-list').children) {
                    document.getElementById('brokers-list').removeChild(elem);
                }*/
                const lst = document.getElementById('brokers-list');
                for(let i = 0; i < stocksToBrokers.length; ++i) {
                    const items = Array.from(lst.children[i].children).filter( (elem) => {
                        return elem.tagName === "LI"
                    } );
                    for(let j = 0; j < stocksToBrokers[i].length; ++j) {
                        items[j].innerHTML =
                            `${stocksToBrokers[i][j].code}: ${stocksToBrokers[i][j].count}`;
                    }
                }
                return;
            }
            const brokersRepr = document.getElementById('brokers-list').children;
            for(let i = 0; i < brokersRepr.length; ++i) {
                for(let obj of stocksToBrokers[i]) {
                    const li = document.createElement("li");
                    li.innerHTML = `${obj.code}: ${obj.count}`
                    brokersRepr[i].appendChild(li);
                }
            }
        });

        socket.on("stocks", (stocks) => {
            this.setState({brokers: this.state.brokers, stocks: stocks});
            console.debug(this.state);
        });
    }

    onStart(e) {
        document.getElementById("start").disabled = true;
        socket.emit("start", null);
    }

    render() {
        return(
            <div>
                <div className={"w3-center w3-container w3-blue"}>
                    <h2>Administrator page</h2>
                </div>
                <div className={"w3-container w3-center"}>
                    <button className={"content-standalone"} id={"start"} onClick={this.onStart}>
                        Start
                    </button>
                </div>
                <div className={"w3-container"}>
                    <ul id={"brokers-list"} className={"w3-ul"}>

                    </ul>
                </div>
                <div className={"w3-container"}>
                    <p>Current stock prices:<br/>
                    {this.state.stocks ?
                        JSON.stringify(this.state.stocks)
                            .replaceAll('"', "")
                            .split(new RegExp("[\\[\\]{},]"))
                            .filter((s) => s.length)
                            .filter( (s) => !(s.indexOf("code")) || !(s.indexOf("price")) )
                            .map( (s) => {
                                if(!(s.indexOf("code"))) {
                                    return s + ": ";
                                }
                                return s + "\n";
                            } )
                            .join("")
                            .replaceAll(new RegExp("[a-z]+:", "g"), "")
                        : ""}
                    </p>
                </div>
                <div className={"w3-container w3-center"}>
                    <a href={"/"} className={"link-like"}>Home</a>
                </div>
            </div>
        );
    }
}

export default Admin