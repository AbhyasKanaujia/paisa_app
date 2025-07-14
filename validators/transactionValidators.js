const { z } = require("zod");

// Enums for type and date coercion
const typeEnum = z.enum(["expense", "income"]);
const objectId = z.string().length(24, "Invalid ObjectId");
const hexColor = z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Invalid hex color");

const baseTransactionSchema = z.object({
  user_id: objectId,
  type: typeEnum,
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  vendor: z.string().optional(),
  from_account: z.string().optional(),
  date: z.coerce.date(),
  tags: z.array(z.string()).optional(),
  raw_input: z.string().min(1, "raw_input is required"),
  batch_id: objectId.optional()
});

// PATCH: allow partials, but require at least one field
const updateTransactionSchema = baseTransactionSchema.partial().refine(data =>
    Object.keys(data).length > 0,
  { message: "At least one field is required for update" }
);

// BATCH input: array of baseTransactionSchema minus user_id
const createBatchSchema = z.object({
  user_id: objectId,
  transactions: z.array(
    baseTransactionSchema.omit({ user_id: true })
  ).min(1, "At least one transaction is required")
});

// Middleware functions
function validateCreateTransaction(req, res, next) {
  const result = baseTransactionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid transaction",
      errors: result.error.format()
    });
  }
  req.body = result.data;
  next();
}

function validateUpdateTransaction(req, res, next) {
  const result = updateTransactionSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid transaction update",
      errors: result.error.format()
    });
  }
  req.body = result.data;
  next();
}

function validateBatchTransactions(req, res, next) {
  const result = createBatchSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid batch input",
      errors: result.error.format()
    });
  }
  req.body = result.data;
  next();
}

module.exports = {
  validateCreateTransaction,
  validateUpdateTransaction,
  validateBatchTransactions
};
