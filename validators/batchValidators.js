const { z } = require("zod");

const pinnedContextSchema = z.object({
  from_account: z.string().optional(),
  date: z.coerce.date().optional(),
  tags: z.array(z.string()).optional()
}).optional();

const createBatchSchema = z.object({
  user_id: z.string().length(24, "Invalid user_id"),
  pinned_context: pinnedContextSchema,
  raw_inputs: z.array(z.string().min(1)).min(1, "At least one raw input is required")
});

function validateCreateBatch(req, res, next) {
  const result = createBatchSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid batch data",
      errors: result.error.format()
    });
  }
  req.body = result.data;
  next();
}

module.exports = { validateCreateBatch };
