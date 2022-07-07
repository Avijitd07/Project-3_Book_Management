const bookModel = require("../models/bookModel")
const userModel = require("../models/userModel")
const ObjectId = require('mongoose').Types.ObjectId
const moment = require('moment')


const isbnReGeX = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/


const isValid = function (x) {
    if (typeof x == "undefined" || x == null) return false;
    if (typeof x == "string" && x.trim().length == 0) return false;

    return true;
};
const isValidBody = function (x) {
    return Object.keys(x).length > 0;
};


const createBook = async function (req, res) {
    try {

        let body = req.body

        if (!isValidBody(body)) {
            return res.status(400).send({ status: false, message: "Invalid Request Parameter, Please Provide Another Details" });
        }

        const { title, excerpt, category, subcategory, ISBN, userId, releasedAt } = body


        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Title is Required" })
        }
        if (!isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "Excerpt is Required" })
        }
        if (!isValid(category)) {
            return res.status(400).send({ status: false, message: "category is Required" })
        }
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId is Required" })
        }
        if (!isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN is Required" })
        }
        // if (!isValid(subcategory)) {
        //     return res.status(400).send({ status: false, message: "subcategory is Required" })
        // }

        if (!isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: "Please provide released date" });
        }

        //Date format("YYYY-MM-DD") validation
        const dateRgx =
            /^(18|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/.test(
                body.releasedAt
            );
        if (!dateRgx) {
            return res.status(400).send({
                status: false,
                message: "Please provide valid date in this formate YYYY-MM-DD",
            });
        }

        //validation of ISBN
        if (!isbnReGeX.test(ISBN)) return res.status(400).send({ status: false, message: "Not a valid ISBN" })


        // checking vaild userId
        if (!ObjectId.isValid(userId)) {
            return res.status(400).send({ status: false, message: "Bad Request. UserId invalid" })
        }
        let getUserData = await userModel.findById(userId)
        if (!getUserData) return res.status(404).send({ status: false, message: "Data not found" })



        // checking for unique title and ISBN
        let getBookDetails = await bookModel.findOne({ $or: [{ title: title }, { ISBN: ISBN }] })

        if (getBookDetails) {
            if (getBookDetails.title == title) {
                return res.status(400).send({ status: false, message: `${title} title already registered ` })
            } else {
                return res.status(400).send({ status: false, message: `${ISBN} ISBN already registered` })
            }
        }
        
        const validBlogData = { title, excerpt, category, ISBN, userId, releasedAt }

        if (subcategory) {
            if (Array.isArray(subcategory)) {
                validBlogData['subcategory'] = [...subcategory]
            }
        }

        let bookData = await bookModel.create(validBlogData)

        console.log("third")
        return res.status(201).send({ status: true, data: bookData })

    } catch (err) {

        return res.status(500).send({ message: "Server side Errors. Please try again later", error: err.message })

    }
}
const bookDetails = async function (req, res) {
    try {
        let query = req.query;
        let { userId, category, subcategory } = query;
        let filter = { isDeleted: false };

        if (subcategory) filter.subcategory = { $all: subcategory.split(",") }
        if (category) filter.category = category;
        if (userId) filter.userId = userId;

        if (query.userId) {
            const validate = await userModel.findById(query.userId);
            if (!validate) return res.status(404).send({ status: false, message: "UserId is not valid" });
        }

        const data = await bookModel.find(filter).select({ ISBN: 0, subcategory: 0, __v: 0 }).sort({ title: 1 })
        if (!data) return res.status(404).send({ status: false, message: "No book is found" })
        return res.status(200).send({
            status: true,
            message: "Book List",
            data: data

        })
    } catch (err) {

        return res.status(500).send({ status: false, Error: err.message })
    }
}

const updateBook = async function (req, res) {

    try {
        let bookId = req.params.bookId
        let reqBody = req.body

        let { title, excerpt, releasedAt, ISBN } = reqBody;

        // checking for valid bookId
        if (!ObjectId.isValid(bookId)) return res.status(400).send({ status: false, message: "Not a valid Book ID" })



        //checking body is empty or not
        if (!isValidBody(reqBody)) {
            return res.status(400).send({ status: false, message: "Please enter a field to update" });
        }



        //checking that title key is having value or not
        if ("title" in reqBody && !isValid(title)) {
            return res.status(400).send({ status: false, message: "Title is Required, to update Title" })
        }
        //checking for unique book title
        if (title) {
            uniqueBookTitle = await bookModel.findOne({ title: title }).select({ title: 1 })
            if (uniqueBookTitle) return res.status(400).send({ status: false, message: "You can not update with this book title as, this title is already present" })
        }



        //checking that ISBN key is having value or not
        if ("ISBN" in reqBody && !isValid(ISBN)) {
            return res.status(400).send({ status: false, message: "ISBN is Required, to update ISBN" })
        }
        //checking for unique book ISBN
        if (ISBN) {
            uniqueBookisbn = await bookModel.findOne({ ISBN: ISBN }).select({ ISBN: 1 })
            if (uniqueBookisbn) return res.status(400).send({ status: false, message: "You can not update with this book ISBN as, this book ISBN is already present" })
        }
        //validation of ISBN
        if (!isbnReGeX.test(ISBN)) return res.status(400).send({ status: false, message: "Not a valid ISBN" })



        //checking that releasedAt key is having value or not
        if ("releasedAt" in reqBody && !isValid(releasedAt)) {
            return res.status(400).send({ status: false, message: "Released is Required, to update releasedAt" })
        }



        //checking that excerpt key is having value or not
        if ("excerpt" in reqBody && !isValid(excerpt)) {
            return res.status(400).send({ status: false, message: "Excerpt is Required, to update excerpt" })
        }




        let updatedBookData = await bookModel.findOneAndUpdate(
            { _id: bookId, isDeleted: false },
            {
                $set: {
                    title,
                    excerpt,
                    releasedAt,
                    ISBN
                }
            }, { new: true })

        if (!updatedBookData) return res.status(404).send({ status: false, message: "Data not found" })

        return res.status(200).send({ status: true, message: "success", data: updatedBookData })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

const deleteBookById = async function (req, res) {
    try {
        let enteredBookId = req.params.bookId

        if (!ObjectId.isValid(enteredBookId)) return res.status(400).send({ status: false, message: "Bad Request. BookId invalid" })


        let deleteDate = moment().format('YYYY-MM-DD h:mm:ss')

        const searchBook = await bookModel.findOneAndUpdate(
            { _id: enteredBookId, isDeleted: false },
            { isDeleted: true, deletedAt: deleteDate }
        )

        if (!searchBook) return res.status(404).send({ status: false, message: "Resource not found. BookId doesnot exist" })


        return res.status(200).send({ status: true, message: "Book successfully deleted" })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}


module.exports = { createBook, bookDetails, updateBook, deleteBookById }