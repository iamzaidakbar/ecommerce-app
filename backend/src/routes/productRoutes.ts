import express from "express";
import { body } from "express-validator";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from "../controllers/productController";
import { validateRequest } from "../middleware/validateRequest";
import { requireAuth, requireAdmin } from "../middleware/auth";
const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:id", getProduct);

// Protected routes (admin only)
router.use(requireAuth, requireAdmin);

router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Product name is required"),
    body("description")
      .notEmpty()
      .withMessage("Product description is required"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("category").notEmpty().withMessage("Category is required"),
    body("stock")
      .isInt({ min: 0 })
      .withMessage("Stock must be a positive integer"),
  ],
  validateRequest,
  createProduct
);

router.put(
  "/:id",
  [
    body("name")
      .optional()
      .notEmpty()
      .withMessage("Product name cannot be empty"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock must be a positive integer"),
  ],
  validateRequest,
  updateProduct
);

router.delete("/:id", deleteProduct);

export default router;
