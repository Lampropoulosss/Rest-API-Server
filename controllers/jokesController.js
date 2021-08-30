const Joke = require("../models/Joke");


const jokes_index = (req, res) => {
    Joke.find()
        .then((result) => {
            const totalJokes = result.length;
            const number = Math.floor(Math.random() * totalJokes);
            res.json(result[number]);
        })
        .catch((err) => {
            res.status(400).json({ msg: "An error has occured. It has been recorded and will be investigated" });
        });
};

const jokes_index_all = (req, res) => {
    Joke.find()
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            res.status(400).json({ msg: "An error has occured. It has been recorded and will be investigated" });
        });
};

const jokes_index_index = (req, res) => {
    Joke.find()
        .then((result) => {
            if (req.params.index > result.length - 1) {
                return res.status(400).json({ msg: `Joke with index ${req.params.index} cannot be found` })
            };

            res.json(result[parseInt(req.params.index)]);
        })
        .catch((err) => {
            res.status(400).json({ msg: "An error has occured. It has been recorded and will be investigated" });
        });
};

const jokes_create = (req, res) => {
    const newJoke = new Joke({
        question: req.body.question,
        answer: req.body.answer
    });

    newJoke.save()
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            res.status(400).json({ msg: "An error has occured. It has been recorded and will be investigated" });
        });
};

const jokes_delete = (req, res) => {
    Joke.findByIdAndDelete(req.params.id)
        .then((result) => {
            res.json({ msg: `Joke with ID ${result._id} has been deleted` })
        })
        .catch((err) => {
            res.status(400).json({ msg: "An error has occured. It has been recorded and will be investigated" });
        });

    // let data = fs.readFileSync(path.join(__dirname, "jokes.json"));
    // data = JSON.parse(data);
    // data.splice(req.params.index, 1);
    // data = JSON.stringify(data);
    // fs.writeFileSync(path.join(__dirname, "jokes.json"), data, "utf8");
    // delete require.cache[require.resolve("./jokes.json")];
    // jokes = require("./jokes.json")
    // res.json(jokes);
};

module.exports = {
    jokes_index,
    jokes_index_all,
    jokes_index_index,
    jokes_create,
    jokes_delete
};