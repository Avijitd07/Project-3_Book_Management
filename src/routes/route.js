const express = require("express"); // --> importing the express framework
const router = express.Router();
const bookController = require("../controllers/bookController")
const userController = require("../controllers/userController")
const reviewController = require("../controllers/reviewController")
const { authentication } = require("../middleware/auth")

router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)

//////////////////////--> Using authentication form here////////////////////

router.post("/books", authentication, bookController.createBook)
router.get("/books", authentication, bookController.bookDetails)
router.get("/books/:bookId", bookController.getBookDetails)


///-->review apis
router.post("/books/:bookId/review", reviewController.createReview)




module.exports = router;