const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        await mongoose.connect("mongodb//:localhost:12027/students", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Mongo Connected...");
    }catch (err) {
        console.error("Mongo Connection failed ", err.message);
        process.exit(1);
    }
}

module.exports = connectDb;
