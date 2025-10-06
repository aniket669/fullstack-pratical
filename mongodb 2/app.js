const express = require('express');
const path = require("path");
const app = express();
const routes = require("./routes/index");
const connectDb = require("./config/db");

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

connectDb();

app.use('/api', routes);

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
