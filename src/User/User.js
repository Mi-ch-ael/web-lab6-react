import React, {Component} from "react";
import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:4080' , {transports: ['websocket']});

class User extends Component {
    constructor(props) {
        super(props);
        this.onBuy = this.onBuy.bind(this);
        this.beatifyOwnedStocks = this.beatifyOwnedStocks.bind(this);
        this.renderStockPrices = this.renderStockPrices.bind(this);
        this.renderStockSelect = this.renderStockSelect.bind(this);
        this.onAmountSelect = this.onAmountSelect.bind(this);
        this.onStockSelect = this.onStockSelect.bind(this);
        //this.render = this.render.bind(this);
        const arr = window.location.toString().split("/");
        this.state = {
            lastName: arr[arr.length - 1],
            money: null,
            startMoney: null,
            id: null,
            ownedStocks: [],
            chosenStock: 0,
            chosenAmount: -100
        }
        console.debug(this.state.lastName);

        socket.on("brokers", (brokers) => {
            for(const broker of brokers) {
                if(broker.lastName === this.state.lastName) {
                    this.setState({
                        lastName: this.state.lastName,
                        money: broker.money,
                        id: brokers.indexOf(broker),
                        ownedStocks: this.state.ownedStocks
                    });
                    if(this.state.startMoney === null && this.state.ownedStocks && this.state.stocks) {
                        console.debug("Setting start money")
                        let totalStocks = 0;
                        for(let i = 0; i < this.stocks.length; ++i) {
                            totalStocks += this.state.stocks[i].price * this.state.ownedStocks[i].count;
                        }
                        this.setState({startMoney: this.state.money + totalStocks});
                    }
                }
            }
        });
        socket.on("stocks", (stocks) => {
            this.stocks = stocks;
            this.setState({stocks: stocks});
        });
        socket.on("stocksToBrokers", (stocksToBrokers) => {
            this.setState({
                ownedStocks: stocksToBrokers[this.state.id]
            });
            this.beatifyOwnedStocks();
        });
    }

    onBuy(e) {
        console.debug(e);
        console.debug(this.state.ownedStocks);
        if(this.state.ownedStocks.length === 0) return;
        if(this.stocks.length === 0) return;
        if(this.state.ownedStocks[this.state.chosenStock].count + this.state.chosenAmount < 0) {
            alert("You cannot sell more stocks than you have!");
            return;
        }
        if(this.state.money - this.state.chosenAmount*this.stocks[this.state.chosenStock].price < 0) {
            alert("Not enough money!");
            return;
        }
        this.state.ownedStocks[this.state.chosenStock].count += this.state.chosenAmount;
        console.debug(this.state.ownedStocks);
        this.setState({
            money:
                this.state.money - this.state.chosenAmount*this.stocks[this.state.chosenStock].price
        }, () => {
            const brokerData = {id: this.state.id, money: this.state.money};
            socket.emit("broker", brokerData);
            socket.emit("ownedStocks", {id: this.state.id, stocks: this.state.ownedStocks});
            console.debug(this.state.money);
            this.calculateProfit();
        });
        this.beatifyOwnedStocks();
    }

    /*trade(stock, number) {

    }*/

    calculateProfit() {
        if(!this.stocks || !this.state || !this.state.ownedStocks || !this.state.startMoney) return;
        let actives = this.state.money;
        for(let i = 0; i < this.stocks.length; ++i) {
            actives += this.stocks[i].price * this.state.ownedStocks[i].count;
        }
        return actives - this.state.startMoney;
    }

    renderStockPrices() {
        if(!this.state.stocks) return (
            <p>Awaiting stock info... When bargain starts, stock prices will refresh over time.</p>
        );
        let htmlString = "";
        for(let i = 0; i < this.state.stocks.length; ++i) {
            const stock = this.state.stocks[i];
            htmlString += `${stock.code} (${stock.name}) is worth ${stock.price}<br>`;
        }
        return (<p className={"content-standalone"}
        dangerouslySetInnerHTML={ {__html: htmlString} }></p>);
    }

    renderStockSelect() {
        if(!this.stocks) return null;
        let htmlString = ``;
        for(let i = 0; i < this.stocks.length; ++i) {
            const stock = this.stocks[i];
            htmlString += `<option value="${i}">${stock.code} (${stock.name})</option>`
        }
        return (
            <select className={"button-like content-standalone"} onChange={this.onStockSelect}
            dangerouslySetInnerHTML={ {__html: htmlString} }>
            </select>
        )
    }

    beatifyOwnedStocks() {
        const paragraph = document.getElementById("owned-stocks");
        let html = "";
        for(const elem of this.state.ownedStocks) {
            html += `${elem.code}: ${elem.count} stocks owned<br>`;
        }
        console.debug(html);
        paragraph.innerHTML = html;
    }

    onAmountSelect(e) {
        console.debug(e.target.value);
        console.debug(this.state.chosenAmount)
        this.setState({
            chosenAmount: parseInt(e.target.value)
        },
            () => {console.debug(this.state.chosenAmount)});
        console.debug(this.state.chosenAmount);
    }

    onStockSelect(e) {
        this.setState({
                chosenStock: parseInt(e.target.value)
            },
            () => console.debug(this.state.chosenStock));
    }

    render() {
        return(
            <div>
                <div className={"w3-container w3-center w3-blue"}>
                    <h2>User page</h2>
                </div>
                <p className={"content-standalone"}>Money: {this.state.money === null ? "" : this.state.money}</p>
                <div className={"content-standalone"} id={"what"}>
                    Stocks:<br/>
                    { this.renderStockPrices() }
                </div>
                <div className={"content-center"}>
                    {this.renderStockSelect()}
                    <select className={"button-like content-standalone"}
                            onChange={this.onAmountSelect}>
                        <option value={-100}>Sell 100</option>
                        <option value={-10}>Sell 10</option>
                        <option value={-5}>Sell 5</option>
                        <option value={-2}>Sell 2</option>
                        <option value={-1}>Sell 1</option>
                        <option value={1}>Buy 1</option>
                        <option value={2}>Buy 2</option>
                        <option value={5}>Buy 5</option>
                        <option value={10}>Buy 10</option>
                        <option value={100}>Buy 100</option>
                    </select>
                    <button className={"content-standalone"} onClick={this.onBuy}>Trade</button>
                </div>
                <div className={"w3-container"}>
                    <p>Profit: {this.calculateProfit()}</p>
                </div>
                <div className={"w3-container"}>
                    <p id={"owned-stocks"}>Owned stocks:<br/></p>
                </div>
                <div className={"w3-center w3-container"}>
                    <a href={"/"} className={"link-like"}>Home</a>
                </div>
            </div>
        )
    }

}

export default User