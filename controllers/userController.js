const User = require("../models/User");

// GET /api/users/:userId
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// POST /api/users
// If user exists (email-based), return existing. Else create new.
exports.createOrUpdateUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(200).json(existingUser);
    }

    const newUser = new User({ email });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating/updating user:", error);
    res.status(400).json({ message: "Failed to create or update user", error: error.message });
  }
};

// PATCH /api/users/:userId/preferences
exports.updatePreferences = async (req, res) => {
  try {
    const updates = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (updates.default_mode) {
      user.preferences.default_mode = updates.default_mode;
    }

    if (updates.pinned_context) {
      user.preferences.pinned_context = {
        ...user.preferences.pinned_context,
        ...updates.pinned_context
      };
    }

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(400).json({ message: "Failed to update preferences", error: error.message });
  }
};
