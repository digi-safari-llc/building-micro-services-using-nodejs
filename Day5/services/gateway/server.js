const gateway = require("express-gateway");
const path = require("path");

process.env.EG_CONFIG_DIR = path.join(__dirname);

gateway().run();

console.log("API Gateway service listening at port defined in config!");
