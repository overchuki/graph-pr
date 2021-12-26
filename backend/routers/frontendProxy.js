const httpProxy = require("http-proxy");
const express = require("express");
const path = require("path");
const router = express.Router();

if (process.env.NODE_ENV === "production") {
    router.use(express.static("./build"));
    router.use((req, res, next) => {
        res.sendFile(path.resolve("./build/index.html"));
    });
} else {
    const proxy = httpProxy.createProxyServer({
        target: "http://localhost:3001",
        ws: true,
    });
    proxy.on("error", (e) => {
        console.log(e);
    });

    router.use((req, res, next) => {
        proxy.web(req, res);
    });
}

module.exports = router;
