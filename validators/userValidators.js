const { z } = require("zod");

// For POST /users — create or lookup by email
const createOrUpdateUserSchema = z.object({
  email: z.string().email("Invalid email")
});

// For PATCH /users/:id/preferences
const updatePreferencesSchema = z.object({
  default_mode: z.enum(["expense", "income"]).optional(),
  pinned_context: z.object({
    from_account: z.string().optional(),
    date: z.coerce.date().optional(),
    tags: z.array(z.string()).optional()
  }).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one preference field must be provided"
});

// Middleware
function validateCreateOrUpdateUser(req, res, next) {
  const result = createOrUpdateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid user input",
      errors: result.error.format()
    });
  }
  req.body = result.data;
  next();
}

function validateUpdatePreferences(req, res, next) {
  const result = updatePreferencesSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid preferences update",
      errors: result.error.format()
    });
  }
  req.body = result.data;
  next();
}

module.exports = {
  validateCreateOrUpdateUser,
  validateUpdatePreferences
};
