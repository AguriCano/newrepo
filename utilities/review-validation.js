const { body, validationResult } = require("express-validator");
const utilities = require("../utilities");

const validate = {};

/* **********************************
 *  Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    // Rating is required and must be between 1-5
    body("review_rating")
      .trim()
      .notEmpty()
      .withMessage("Please select a rating.")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5."),

    // Title is required and must be a string
    body("review_title")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a review title.")
      .isLength({ min: 3, max: 100 })
      .withMessage("Review title must be between 3 and 100 characters."),

    // Body is required and must be a string
    body("review_body")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a review.")
      .isLength({ min: 10, max: 5000 })
      .withMessage("Review must be between 10 and 5000 characters."),
  ];
};

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { review_rating, review_title, review_body } = req.body;
  let errors = [];
  errors = validationResult(req);

  if (!errors.isEmpty()) {
    // If editing, get review and inventory data
    if (req.params.reviewId) {
      const reviewModel = require("../models/review-model");
      const inventoryModel = require("../models/inventory-model");
      const review = await reviewModel.getReviewById(req.params.reviewId);
      const inventory = (await inventoryModel.getInventoryByInventoryId(
        review.review_inv_id
      ))[0];
      let nav = await utilities.getNav();
      return res.render("inventory/edit-review", {
        errors,
        title: `Edit Review - ${inventory.inv_year} ${inventory.inv_make} ${inventory.inv_model}`,
        nav,
        review,
        inventory,
        review_rating,
        review_title,
        review_body,
      });
    } else {
      // If adding new review
      const inventoryModel = require("../models/inventory-model");
      const invData = (await inventoryModel.getInventoryByInventoryId(
        req.params.invId
      ))[0];
      let nav = await utilities.getNav();
      return res.render("inventory/add-review", {
        errors,
        title: `Add Review - ${invData.inv_year} ${invData.inv_make} ${invData.inv_model}`,
        nav,
        inventory: invData,
        review_rating,
        review_title,
        review_body,
      });
    }
  }
  next();
};

module.exports = validate;
