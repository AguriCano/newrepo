const { validationResult } = require("express-validator");
const utilities = require("../utilities");
const reviewModel = require("../models/review-model");
const inventoryModel = require("../models/inventory-model");

/**
 * Display reviews for a vehicle
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function buildReviewView(req, res, next) {
  try {
    const invId = req.params.invId;
    
    // Validate inventory exists
    const invData = await inventoryModel.getInventoryById(invId);
    if (!invData) {
      return res.status(404).render("errors/error", {
        title: "404 - Vehicle Not Found",
        message: "The requested vehicle could not be found.",
      });
    }

    let nav = await utilities.getNav();
    const reviews = await reviewModel.getReviewsByInventoryId(invId);
    const ratingData = await reviewModel.getAverageRating(invId);
    
    const reviewsTable = utilities.buildReviewsTable(reviews);
    const hasReviewed = res.locals.loggedin
      ? await reviewModel.hasAccountReviewed(invId, res.locals.accountData.account_id)
      : false;

    res.render("inventory/reviews", {
      title: `Reviews - ${invData.inv_year} ${invData.inv_make} ${invData.inv_model}`,
      nav,
      inventory: invData,
      reviews: reviewsTable,
      rating: ratingData,
      hasReviewed,
      errors: null,
    });
  } catch (error) {
    console.error("Error building review view:", error);
    next(error);
  }
}

/**
 * Build review form page
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function buildAddReviewForm(req, res, next) {
  try {
    const invId = req.params.invId;

    // Validate inventory exists
    const invData = await inventoryModel.getInventoryById(invId);
    if (!invData) {
      return res.status(404).render("errors/error", {
        title: "404 - Vehicle Not Found",
        message: "The requested vehicle could not be found.",
      });
    }

    // Check if user has already reviewed
    const hasReviewed = await reviewModel.hasAccountReviewed(
      invId,
      res.locals.accountData.account_id
    );

    if (hasReviewed) {
      req.flash(
        "notice",
        "You have already reviewed this vehicle. You can only leave one review per vehicle."
      );
      return res.redirect(`/inventory/reviews/${invId}`);
    }

    let nav = await utilities.getNav();

    res.render("inventory/add-review", {
      title: `Add Review - ${invData.inv_year} ${invData.inv_make} ${invData.inv_model}`,
      nav,
      inventory: invData,
      errors: null,
    });
  } catch (error) {
    console.error("Error building add review form:", error);
    next(error);
  }
}

/**
 * Process new review submission
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function addReview(req, res, next) {
  try {
    const invId = req.params.invId;
    const { review_rating, review_title, review_body } = req.body;
    const accountId = res.locals.accountData.account_id;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const invData = await inventoryModel.getInventoryById(invId);
      let nav = await utilities.getNav();
      return res.render("inventory/add-review", {
        title: `Add Review - ${invData.inv_year} ${invData.inv_make} ${invData.inv_model}`,
        nav,
        inventory: invData,
        errors: errors.array(),
      });
    }

    // Check if user has already reviewed this vehicle
    const hasReviewed = await reviewModel.hasAccountReviewed(invId, accountId);
    if (hasReviewed) {
      req.flash(
        "notice",
        "You have already reviewed this vehicle. You can only leave one review per vehicle."
      );
      return res.redirect(`/inventory/reviews/${invId}`);
    }

    // Insert review into database
    const newReview = await reviewModel.insertReview(
      invId,
      accountId,
      parseInt(review_rating),
      review_title.trim(),
      review_body.trim(),
      false
    );

    if (newReview) {
      req.flash("success", "Your review has been posted successfully!");
      res.redirect(`/inventory/reviews/${invId}`);
    } else {
      throw new Error("Failed to insert review");
    }
  } catch (error) {
    console.error("Error adding review:", error);
    req.flash(
      "notice",
      "An error occurred while posting your review. Please try again."
    );
    res.redirect(`/inventory/reviews/${req.params.invId}`);
  }
}

/**
 * Build edit review form
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function buildEditReviewForm(req, res, next) {
  try {
    const reviewId = req.params.reviewId;
    const review = await reviewModel.getReviewById(reviewId);

    if (!review) {
      req.flash("notice", "Review not found.");
      return res.redirect("/");
    }

    // Check authorization - only review author can edit
    if (review.review_account_id !== res.locals.accountData.account_id) {
      req.flash("notice", "You are not authorized to edit this review.");
      return res.redirect(`/inventory/reviews/${review.review_inv_id}`);
    }

    const inventory = await inventoryModel.getInventoryById(
      review.review_inv_id
    );
    let nav = await utilities.getNav();

    res.render("inventory/edit-review", {
      title: `Edit Review - ${inventory.inv_year} ${inventory.inv_make} ${inventory.inv_model}`,
      nav,
      review,
      inventory,
      errors: null,
    });
  } catch (error) {
    console.error("Error building edit review form:", error);
    next(error);
  }
}

/**
 * Process review update
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function updateReview(req, res, next) {
  try {
    const reviewId = req.params.reviewId;
    const { review_rating, review_title, review_body } = req.body;

    // Validate ownership
    const review = await reviewModel.getReviewById(reviewId);
    if (review.review_account_id !== res.locals.accountData.account_id) {
      req.flash("notice", "You are not authorized to edit this review.");
      return res.redirect("/");
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();
      return res.render("inventory/edit-review", {
        title: `Edit Review`,
        nav,
        review,
        inventory: await inventoryModel.getInventoryById(review.review_inv_id),
        errors: errors.array(),
      });
    }

    const updatedReview = await reviewModel.updateReview(
      reviewId,
      parseInt(review_rating),
      review_title.trim(),
      review_body.trim()
    );

    if (updatedReview) {
      req.flash("success", "Your review has been updated successfully!");
      res.redirect(`/inventory/reviews/${review.review_inv_id}`);
    }
  } catch (error) {
    console.error("Error updating review:", error);
    req.flash(
      "notice",
      "An error occurred while updating your review. Please try again."
    );
    res.redirect("/");
  }
}

/**
 * Delete a review
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function deleteReview(req, res, next) {
  try {
    const reviewId = req.params.reviewId;
    const review = await reviewModel.getReviewById(reviewId);

    if (!review) {
      req.flash("notice", "Review not found.");
      return res.redirect("/");
    }

    // Check authorization - only review author or admin can delete
    if (
      review.review_account_id !== res.locals.accountData.account_id &&
      res.locals.accountData.account_type !== "Admin"
    ) {
      req.flash("notice", "You are not authorized to delete this review.");
      return res.redirect(`/inventory/reviews/${review.review_inv_id}`);
    }

    const deletedReview = await reviewModel.deleteReview(reviewId);

    if (deletedReview) {
      req.flash("success", "Your review has been deleted successfully!");
      res.redirect(`/inventory/reviews/${review.review_inv_id}`);
    }
  } catch (error) {
    console.error("Error deleting review:", error);
    req.flash(
      "notice",
      "An error occurred while deleting your review. Please try again."
    );
    res.redirect("/");
  }
}

module.exports = {
  buildReviewView,
  buildAddReviewForm,
  addReview,
  buildEditReviewForm,
  updateReview,
  deleteReview,
};
