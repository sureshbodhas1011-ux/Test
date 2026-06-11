import { Request, Response } from 'express';
import { isMockMode, localDb } from '../config/db';
import Review from '../models/Review';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.params;

  try {
    let reviews: any[];
    if (isMockMode) {
      reviews = localDb.find('reviews', r => r.productId === productId);
    } else {
      reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    }
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Server reviews fetch error' });
  }
};

// @desc    Create a product review
// @route   POST /api/reviews
export const createProductReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, rating, title, comment } = req.body;

  if (!req.user) {
    res.status(401).json({ error: 'Not authorized' });
    return;
  }

  if (!productId || !rating || !title || !comment) {
    res.status(400).json({ error: 'Please enter all review details' });
    return;
  }

  const numericRating = parseInt(rating, 10);
  if (numericRating < 1 || numericRating > 5) {
    res.status(400).json({ error: 'Rating must be between 1 and 5' });
    return;
  }

  try {
    // 1. Check if product exists
    let product: any;
    if (isMockMode) {
      product = localDb.findById('products', productId);
    } else {
      product = await Product.findById(productId);
    }

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    // 2. Prevent duplicate reviews by same user
    let alreadyReviewed = false;
    if (isMockMode) {
      alreadyReviewed = !!localDb.findOne('reviews', r => r.productId === productId && r.userId === req.user!.id);
    } else {
      const existingReview = await Review.findOne({ productId, userId: req.user.id });
      alreadyReviewed = !!existingReview;
    }

    if (alreadyReviewed) {
      res.status(400).json({ error: 'You have already reviewed this product' });
      return;
    }

    // 3. Create review
    const reviewData = {
      productId,
      userId: req.user.id,
      username: req.user.name,
      rating: numericRating,
      title,
      comment
    };

    let newReview: any;
    if (isMockMode) {
      newReview = localDb.create('reviews', reviewData);
    } else {
      const reviewDoc = new Review(reviewData);
      newReview = await reviewDoc.save();
    }

    // 4. Update Product Average Rating and Count
    let reviewsList: any[];
    if (isMockMode) {
      reviewsList = localDb.find('reviews', r => r.productId === productId);
    } else {
      reviewsList = await Review.find({ productId });
    }

    const reviewCount = reviewsList.length;
    const ratingsAvg = parseFloat(
      (reviewsList.reduce((acc, item) => acc + item.rating, 0) / reviewCount).toFixed(1)
    );

    if (isMockMode) {
      localDb.findByIdAndUpdate('products', productId, { reviewCount, ratingsAvg });
    } else {
      product.reviewCount = reviewCount;
      product.ratingsAvg = ratingsAvg;
      await product.save();
    }

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ error: 'Server review submission error' });
  }
};
