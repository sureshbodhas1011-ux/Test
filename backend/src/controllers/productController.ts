import { Request, Response } from 'express';
import { isMockMode, localDb } from '../config/db';
import Product from '../models/Product';
import Category from '../models/Category';

// @desc    Get all products (with search, filter, sort, paginate)
// @route   GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const { search, category, minPrice, maxPrice, sortBy, page = 1, limit = 9 } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  try {
    if (isMockMode) {
      let products = localDb.find('products');

      // Search Filter
      if (search) {
        const queryStr = (search as string).toLowerCase();
        products = products.filter(
          (p: any) => p.title.toLowerCase().includes(queryStr) || p.description.toLowerCase().includes(queryStr)
        );
      }

      // Category Filter
      if (category && category !== 'All' && category !== 'all') {
        products = products.filter((p: any) => p.category.toLowerCase() === (category as string).toLowerCase());
      }

      // Price Filters
      if (minPrice) {
        products = products.filter((p: any) => p.price >= parseFloat(minPrice as string));
      }
      if (maxPrice) {
        products = products.filter((p: any) => p.price <= parseFloat(maxPrice as string));
      }

      // Sorting
      if (sortBy === 'price-asc') {
        products.sort((a: any, b: any) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
      } else if (sortBy === 'price-desc') {
        products.sort((a: any, b: any) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
      } else if (sortBy === 'rating') {
        products.sort((a: any, b: any) => b.ratingsAvg - a.ratingsAvg);
      } else {
        // default newest
        products.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      const total = products.length;
      const paginatedProducts = products.slice(skip, skip + limitNum);

      res.json({
        products: paginatedProducts,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      });
    } else {
      // MongoDB Query
      const query: any = {};

      if (search) {
        query.$or = [
          { title: { $regex: search as string, $options: 'i' } },
          { description: { $regex: search as string, $options: 'i' } }
        ];
      }

      if (category && category !== 'All' && category !== 'all') {
        query.category = { $regex: new RegExp(`^${category as string}$`, 'i') };
      }

      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice as string);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
      }

      // Sorting setup
      let sort: any = { createdAt: -1 };
      if (sortBy === 'price-asc') {
        sort = { price: 1 };
      } else if (sortBy === 'price-desc') {
        sort = { price: -1 };
      } else if (sortBy === 'rating') {
        sort = { ratingsAvg: -1 };
      }

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      res.json({
        products,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server product fetch error' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    let product: any;
    if (isMockMode) {
      product = localDb.findById('products', id);
    } else {
      product = await Product.findById(id);
    }

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server product fetch error' });
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const { title, description, price, discountPrice, images, category, stock, specifications, bestSeller, featured } = req.body;

  if (!title || !description || !price || !images || images.length === 0 || !category) {
    res.status(400).json({ error: 'Please enter all required product fields' });
    return;
  }

  try {
    let newProduct: any;
    const productData = {
      title,
      description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      images,
      category,
      stock: parseInt(stock, 10) || 0,
      specifications: specifications || {},
      bestSeller: !!bestSeller,
      featured: !!featured,
      ratingsAvg: 0,
      reviewCount: 0
    };

    if (isMockMode) {
      newProduct = localDb.create('products', productData);
    } else {
      const productDoc = new Product(productData);
      newProduct = await productDoc.save();
    }

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Server product creation error' });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    let updatedProduct: any;

    if (isMockMode) {
      updatedProduct = localDb.findByIdAndUpdate('products', id, req.body);
    } else {
      updatedProduct = await Product.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    }

    if (!updatedProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Server product update error' });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    let deletedProduct: any;
    if (isMockMode) {
      deletedProduct = localDb.findByIdAndDelete('products', id);
    } else {
      deletedProduct = await Product.findByIdAndDelete(id);
    }

    if (!deletedProduct) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ message: 'Product successfully deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server product deletion error' });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    let categories: any[];
    if (isMockMode) {
      categories = localDb.find('categories');
    } else {
      categories = await Category.find();
    }
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Server categories fetch error' });
  }
};

// @desc    Create category (Admin)
// @route   POST /api/categories
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  const { name, image } = req.body;
  if (!name || !image) {
    res.status(400).json({ error: 'Please enter category name and image url' });
    return;
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  try {
    let newCategory: any;
    const categoryData = { name, slug, image };

    if (isMockMode) {
      const exists = !!localDb.findOne('categories', c => c.slug === slug);
      if (exists) {
        res.status(400).json({ error: 'Category already exists' });
        return;
      }
      newCategory = localDb.create('categories', categoryData);
    } else {
      const exists = await Category.findOne({ slug });
      if (exists) {
        res.status(400).json({ error: 'Category already exists' });
        return;
      }
      const categoryDoc = new Category(categoryData);
      newCategory = await categoryDoc.save();
    }

    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Server category creation error' });
  }
};
