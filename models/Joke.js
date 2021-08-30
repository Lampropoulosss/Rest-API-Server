const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jokeSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    }
});

const Joke = mongoose.model("Jokes", jokeSchema);

module.exports = Joke;
