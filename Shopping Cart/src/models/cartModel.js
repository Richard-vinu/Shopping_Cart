import mongoose  from 'mongoose';
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema({ 
  userId: {
    type: ObjectId,
    ref: 'User',
    required: 'userId is required',
    trim: true,
  },
  items: [{
    productId: {
      type: ObjectId,
      ref: 'Product',
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: false,
      trim: true,
      max: 1,
      
    },
    _id:false

}],
  totalPrice: {
    type: Number,
    trim: true
  },
  totalItems: {
    type: Number,
    trim: true
  },
},{timestamps: true});

export default mongoose.model('Cart', cartSchema);