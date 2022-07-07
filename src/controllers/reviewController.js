const bookModel = require("../models/bookModel")
const reviewModel = require("../models/reviewModel")

const createReview = async function(req, res) {
    try {
        let _id = req.params.bookId
        let data = req.body;
        let book = await bookModel.findOne({ $and: [{ _id }, { isDeleted: false }] })
        if (!book) return res.status(404).send({ status: false, message: "There is no book with that id" })
        const { rating } = data;

        let arr = Object.keys(data);

        //if empty request body
        if (arr.length == 0) {
            return res
                .status(400)
                .send({ status: false, message: "Please provide input" });
        }

        //mandatory fields

        if (!rating) {
            return res
                .status(400)
                .send({ status: false, message: "rating is required" });
        }

        //rating validation
        const validRating = /^([1-5]|1[5])$/.test(rating);
        if (!validRating) {
            return res.status(400).send({
                status: false,
                message: "Invalid rating - rating should be a Number between 1 to 5",
            });
        }

        //assign bookId from path
        data.bookId = _id;
        //create review
        const review = await reviewModel.create(data);
        // const updatedBook = await bookModel
        //     .findByIdAndUpdate({ _id }, { $inc: { reviews: 1 } }, { new: true })
        //     .lean(); //unfreeze doc.



        // updatedBook.reviewsData = review;


        res.status(200).send({ status: true, message: "success", data: review })
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports = { createReview }