import mongoose from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: ObjectId,
          ref: "Product",
          
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    totalPrice: {
      type: Number,
    },
    totalItems: {
      type: Number,
      
    },
    totalQuantity: {
      type: Number,
      
    },
    cancellable: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "completed", "cancelled"],
    },
    deletedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
