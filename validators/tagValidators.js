const { z } = require("zod");

const createTagSchema = z.object({
  user_id: z.string().length(24, "Invalid user_id"),
  name: z.string().min(1, "Tag name is required"),
  color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Invalid hex color").optional()
});

const updateTagSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/).optional()
}).refine(data => data.name || data.color, {
  message: "At least one field (name or color) must be provided"
});

function validateCreateTag(req, res, next) {
  const result = createTagSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid tag data",
      errors: result.error.format()
    });
  }
  req.body = result.data;
  next();
}

function validateUpdateTag(req, res, next) {
  const result = updateTagSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid tag update",
      errors: result.error.format()
    });
  }
  req.body = result.data;
  next();
}

module.exports = {
  validateCreateTag,
  validateUpdateTag
};
