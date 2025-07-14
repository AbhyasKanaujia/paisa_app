const Tag = require("../models/Tag");

// GET /api/tags/user/:userId
exports.getTagsByUser = async (req, res) => {
  try {
    const tags = await Tag.find({ user_id: req.params.userId, archived: false }).sort({ name: 1 });
    res.status(200).json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
};

// POST /api/tags
exports.createTag = async (req, res) => {
  try {
    const { user_id, name, color } = req.body;

    if (!name || !user_id) {
      return res.status(400).json({ message: "Missing required fields: user_id and name" });
    }

    // Optional: prevent duplicate tags per user
    const existing = await Tag.findOne({ user_id, name: name.toLowerCase(), archived: false });
    if (existing) {
      return res.status(409).json({ message: "Tag already exists" });
    }

    const newTag = new Tag({ user_id, name: name.toLowerCase(), color });
    await newTag.save();
    res.status(201).json(newTag);
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ message: "Failed to create tag" });
  }
};

// PATCH /api/tags/:id
exports.updateTag = async (req, res) => {
  try {
    const { name, color } = req.body;
    const updates = {};

    if (name) updates.name = name.toLowerCase();
    if (color) updates.color = color;

    const tag = await Tag.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json(tag);
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(400).json({ message: "Failed to update tag", error: error.message });
  }
};

// DELETE /api/tags/:id
exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id, { archived: true }, { new: true });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json({ message: "Tag archived", tag });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ message: "Failed to delete tag" });
  }
};
