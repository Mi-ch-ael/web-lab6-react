const express = require("express");
const router = express.Router();

const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

const settings = require("./data/settings.json");
const brokers = require("./data/brokers.json");
const stocks = require("./data/stocks.json");

console.debug(settings);

router.get("/test/",
    (req, res) => {
        res.end("Hello World!");
    });

module.exports = {router, settings, brokers, stocks};
