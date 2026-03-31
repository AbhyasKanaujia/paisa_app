import mongoose from 'mongoose'

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true,
      maxlength: [100, 'Account name must be 100 characters or less'],
    },
    type: {
      type: String,
      required: [true, 'Account type is required'],
      enum: {
        values: ['bank', 'cash', 'credit_card'],
        message: 'Type must be bank, cash, or credit_card',
      },
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
      uppercase: true,
      trim: true,
      maxlength: [3, 'Currency must be a 3-letter code'],
    },
  },
  { timestamps: true }
)

accountSchema.index({ userId: 1, name: 1 }, { unique: true })

export default mongoose.model('Account', accountSchema)
