const pool = require("../database/");

/**
 * Get all reviews for a specific inventory item
 * @param {number} invId - Inventory ID
 * @returns {Promise<Array>} Array of review objects
 */
async function getReviewsByInventoryId(invId) {
  const sqlQuery = `
    SELECT 
        review_id,
        review_inv_id,
        review_account_id,
        review_rating,
        review_title,
        review_body,
        review_created,
        review_verified_purchase,
        account_firstname,
        account_lastname
    FROM public.review
    JOIN public.account ON public.review.review_account_id = public.account.account_id
    WHERE review_inv_id = $1
    ORDER BY review_created DESC`;

  try {
    const result = await pool.query(sqlQuery, [invId]);
    return result.rows;
  } catch (error) {
    console.error("Error getting reviews:", error.message);
    throw error;
  }
}

/**
 * Get a single review by ID
 * @param {number} reviewId - Review ID
 * @returns {Promise<Object>} Review object
 */
async function getReviewById(reviewId) {
  const sqlQuery = `
    SELECT 
        review_id,
        review_inv_id,
        review_account_id,
        review_rating,
        review_title,
        review_body,
        review_created,
        review_verified_purchase,
        account_firstname,
        account_lastname
    FROM public.review
    JOIN public.account ON public.review.review_account_id = public.account.account_id
    WHERE review_id = $1`;

  try {
    const result = await pool.query(sqlQuery, [reviewId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error getting review:", error.message);
    throw error;
  }
}

/**
 * Get average rating for an inventory item
 * @param {number} invId - Inventory ID
 * @returns {Promise<Object>} Object with average rating and review count
 */
async function getAverageRating(invId) {
  const sqlQuery = `
    SELECT 
        COALESCE(AVG(review_rating)::numeric(2,1), 0) as average_rating,
        COUNT(review_id) as review_count
    FROM public.review
    WHERE review_inv_id = $1`;

  try {
    const result = await pool.query(sqlQuery, [invId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error getting average rating:", error.message);
    throw error;
  }
}

/**
 * Insert a new review
 * @param {number} invId - Inventory ID
 * @param {number} accountId - Account ID
 * @param {number} rating - Rating (1-5)
 * @param {string} title - Review title
 * @param {string} body - Review body
 * @param {boolean} verifiedPurchase - Is verified purchase
 * @returns {Promise<Object>} Inserted review object
 */
async function insertReview(invId, accountId, rating, title, body, verifiedPurchase = false) {
  const sqlQuery = `
    INSERT INTO public.review 
    (review_inv_id, review_account_id, review_rating, review_title, review_body, review_verified_purchase)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`;

  try {
    const result = await pool.query(sqlQuery, [
      invId,
      accountId,
      rating,
      title,
      body,
      verifiedPurchase,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error inserting review:", error.message);
    throw error;
  }
}

/**
 * Update a review
 * @param {number} reviewId - Review ID
 * @param {number} rating - Rating (1-5)
 * @param {string} title - Review title
 * @param {string} body - Review body
 * @returns {Promise<Object>} Updated review object
 */
async function updateReview(reviewId, rating, title, body) {
  const sqlQuery = `
    UPDATE public.review
    SET review_rating = $2, review_title = $3, review_body = $4
    WHERE review_id = $1
    RETURNING *`;

  try {
    const result = await pool.query(sqlQuery, [reviewId, rating, title, body]);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating review:", error.message);
    throw error;
  }
}

/**
 * Delete a review
 * @param {number} reviewId - Review ID
 * @returns {Promise<Object>} Deleted review result
 */
async function deleteReview(reviewId) {
  const sqlQuery = `
    DELETE FROM public.review
    WHERE review_id = $1
    RETURNING *`;

  try {
    const result = await pool.query(sqlQuery, [reviewId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error deleting review:", error.message);
    throw error;
  }
}

/**
 * Check if account has already reviewed an inventory item
 * @param {number} invId - Inventory ID
 * @param {number} accountId - Account ID
 * @returns {Promise<boolean>} true if review exists, false otherwise
 */
async function hasAccountReviewed(invId, accountId) {
  const sqlQuery = `
    SELECT COUNT(*) as count
    FROM public.review
    WHERE review_inv_id = $1 AND review_account_id = $2`;

  try {
    const result = await pool.query(sqlQuery, [invId, accountId]);
    return result.rows[0].count > 0;
  } catch (error) {
    console.error("Error checking review:", error.message);
    throw error;
  }
}

module.exports = {
  getReviewsByInventoryId,
  getReviewById,
  getAverageRating,
  insertReview,
  updateReview,
  deleteReview,
  hasAccountReviewed,
};
