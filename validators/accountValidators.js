const { z } = require("zod");

// Schema for creating an account
const createAccountSchema = z.object({
  user_id: z.string().length(24, "Invalid user_id"),
  name: z.string().min(1, "Name is required"),
  type: z.enum(["bank", "wallet", "cash", "other"]).optional(),
  color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Invalid hex color").optional()
});

// Schema for updating an account
const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(["bank", "wallet", "cash", "other"]).optional(),
  color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/).optional()
});

function validateCreateAccount(req, res, next) {
  const result = createAccountSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid account data",
      errors: result.error.format()
    });
  }
  req.body = result.data;
  next();
}

function validateUpdateAccount(req, res, next) {
  const result = updateAccountSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid update data",
      errors: result.error.format()
    });
  }
  req.body = result.data;
  next();
}

module.exports = {
  validateCreateAccount,
  validateUpdateAccount
};
