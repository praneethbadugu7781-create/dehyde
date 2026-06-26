import { Response } from "express";
import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { AuthRequest } from "../middleware/auth.js";
import { slugify } from "../utils/slugify.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getProducts = asyncHandler(async (req, res) => {
  const {
    category,
    size,
    color,
    minPrice,
    maxPrice,
    sort = "newest",
    search,
    featured,
    trending,
    page = "1",
    limit = "12",
  } = req.query;

  const filter: Record<string, unknown> = { isActive: true };
  if (category) {
    const categoryDoc = await Category.findOne({ slug: String(category), isActive: true }).select("_id").lean();
    filter.category = categoryDoc?._id || category;
  }
  if (featured === "true") filter.featured = true;
  if (trending === "true") filter.trending = true;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice);
    if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice);
  }
  if (size) filter.sizes = size;
  if (color) filter["variants.color"] = { $regex: color, $options: "i" };
  if (search) {
    const searchStr = String(search).trim();
    filter.$or = [
      { title: { $regex: searchStr, $options: "i" } },
      { tags: { $regex: searchStr, $options: "i" } },
      { description: { $regex: searchStr, $options: "i" } },
    ];
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    trending: { trending: -1, createdAt: -1 },
  };

  const pageNum = Math.max(1, parseInt(String(page), 10));
  const limitNum = Math.min(48, parseInt(String(limit), 10));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortMap[String(sort)] || sortMap.newest)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    "category",
    "name slug"
  );
  if (!product) {
    res.status(404).json({ success: false, message: "Product not found" });
    return;
  }
  res.json({ success: true, data: product });
});

export const searchProducts = asyncHandler(async (req, res) => {
  const q = String(req.query.q || "").trim();
  if (!q) {
    res.json({ success: true, data: [] });
    return;
  }
  const products = await Product.find({
    isActive: true,
    $or: [
      { title: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ],
  })
    .select("title slug price images rewardCoins category")
    .populate("category", "name slug")
    .limit(8)
    .lean();
  res.json({ success: true, data: products });
});

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = req.body;
  data.slug = data.slug || slugify(data.title);
  const product = await Product.create(data);
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404).json({ success: false, message: "Product not found" });
    return;
  }
  Object.assign(product, req.body);
  await product.save();
  res.json({ success: true, data: product });
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: "Product deactivated" });
});

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true }).sort("order").lean();
  res.json({ success: true, data: categories });
});
