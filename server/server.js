const express = require("express");
const server = express();
const routes = require("./routes").router;

const brokers = require("./routes").brokers;
const settings = require("./routes").settings;
const stocks = require("./routes").stocks;

const stocksToBrokers = new Array(brokers.length);
for(let i = 0; i < brokers.length; ++i) {
    stocksToBrokers[i] = [];
    for(let j = 0; j < stocks.length; ++j) {
        //stocksToBrokers[i][stocks[j].code] = 0;
        stocksToBrokers[i][j] = {count: 0, code: stocks[j].code};
    }
}
console.debug(stocksToBrokers);

const http = require('http');
const bodyParser = require("body-parser");

const cors = require("cors");
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};

const wrappedCors = cors(corsOptions);
server.use(wrappedCors);

server.use("/", routes);

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

const httpServer = http.createServer(server);

const { Server } = require("socket.io");
const io = new Server (httpServer, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] }
});

io.sockets.on("connection", (socket) => {
    socket.emit("test", "Hello World!");
    notify(socket);

    socket.on("start", () => {
        setInterval( () => { updatePrices(); notify() }, settings.changePriceTimeout);
    });

    socket.on("broker", (data) => {
        if(brokers[data.id]) {
            brokers[data.id].money = data.money;
        }
    });

    socket.on("ownedStocks", (data) => {
        if(brokers[data.id]) {
            stocksToBrokers[data.id] = data.stocks
        }
    });

    function notify() {
        socket.broadcast.emit("brokers", brokers);
        socket.emit("brokers", brokers);
        socket.emit("stocksToBrokers", stocksToBrokers);
        socket.broadcast.emit("stocks", stocks);
        socket.emit("stocks", stocks);
    }
});

function updatePrices() {
    for(const stock of stocks) {
        if(stock.distribution === "NORM") {
            stock.price = Math.round((
                Math.round((stock.maxPrice - stock.minPrice)*Math.random() + stock.minPrice) +
                Math.round((stock.maxPrice - stock.minPrice)*Math.random() + stock.minPrice) +
                Math.round((stock.maxPrice - stock.minPrice)*Math.random() + stock.minPrice) +
                Math.round((stock.maxPrice - stock.minPrice)*Math.random() + stock.minPrice) +
                Math.round((stock.maxPrice - stock.minPrice)*Math.random() + stock.minPrice)
            ) / 5);
            continue;
        }
        if(stock.distribution === "EVEN") {
            stock.price = Math.round((stock.maxPrice - stock.minPrice)*Math.random() + stock.minPrice);
        }
    }
}

httpServer.listen(4080);