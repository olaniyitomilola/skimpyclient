const express = require('express');

const app = express();

app.use(express.static('./public'))





app.listen(3005, ()=>{console.log("app is listening on port 3005")})