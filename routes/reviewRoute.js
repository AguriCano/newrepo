// Needed Resources
const express = require("express");
const router = new express.Router();

const reviewController = require("../controllers/reviewController");
const utilities = require("../utilities");
const reviewValidate = require("../utilities/review-validation");

// Route to view reviews for a vehicle
router.get(
  "/reviews/:invId",
  utilities.handleErrors(reviewController.buildReviewView)
);

// Route to display add review form
router.get(
  "/add-review/:invId",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildAddReviewForm)
);

// Route to process new review
router.post(
  "/add-review/:invId",
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.addReview)
);

// Route to display edit review form
router.get(
  "/edit-review/:reviewId",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildEditReviewForm)
);

// Route to process review update
router.post(
  "/edit-review/:reviewId",
  utilities.checkLogin,
  reviewValidate.reviewRules(),
  reviewValidate.checkReviewData,
  utilities.handleErrors(reviewController.updateReview)
);

// Route to delete review
router.post(
  "/delete-review/:reviewId",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview)
);

module.exports = router;
