import cartModel from '../models/cartModel.js'
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import {isValidObjectId,isValidNum,isValid} from "../utils/validation.js"

//POST /users/:userId/cart

const createCart = async (req, res) => {
  try {
    const userId = req.params.userId;
        const requestBody = req.body;

        req.body.quantity = 1

        const { productId ,quantity,cartId} = requestBody;

        // if(!isValidObjectId(cartId))
        // return res.status(400).send({ status: false, message: "invalid CartID" })

      //  let  cartfound = await cartModel.findById(cartId)
      //  if(!cartfound)
      //  return res.status(400).send({ status: false, message: "no cart by this cart-id" })

 
      if(quantity > '1')
      return res.status(400).send({ status: false, message: "Quantity should be 1" })
        


        let user = await cartModel.findById(userId)
    

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false });

        const findCartOfUser = await cartModel.findOne({ userId: userId });

        if (!findCartOfUser) {
            let cartData = {
                userId: userId,
                items: [
                    {
                        productId: productId,
                        quantity: quantity,
                    },
                ],
                totalPrice: findProduct.price * quantity,
                totalItems: 1,
               
            };
            const createCart = await cartModel.create(cartData);
            return res.status(201).send({ status: true, message: `Success`, data: createCart });
        }

//if cart productID presernt in the cart/items 
//In this we just update a qunatity and its price

        if (findCartOfUser) {

      let Totalprice = findCartOfUser.totalPrice + req.body.quantity * findProduct.price;

       let arr = findCartOfUser.items;

            for (let i in arr) {
                if (arr[i].productId.toString() === productId) {
                    arr[i].quantity += quantity;   //just increase the quantity
                    //arr[i].quantity = arr[i].quantity + quantity

                    let updatedCart = {
                        items: arr,
                        totalPrice: Totalprice,
                        totalItems: arr.length,    //1
                    };

                    let responseData = await cartModel.findOneAndUpdate(
                        { _id: findCartOfUser._id },  
                        updatedCart,
                        { new: true }
                    ).populate('items.productId');


                    return res.status(201).send({ status: true, message: `Success`, data: responseData });
                }
            } 

  //if productId is new just *push into the items and *add to total price and *add a total items BY 1
            arr.push({ productId: productId, quantity: quantity });

            let updatedCart = {
                items: arr,
                totalPrice: Totalprice,
                totalItems: arr.length,
            };

            let responseData = await cartModel.findOneAndUpdate({ _id: findCartOfUser._id }, updatedCart, { new: true });
            return res.status(201).send({ status: true, message: `Success`, data: responseData });
        }

  } catch (err) {
    res.status(500).send({ status: false, error: err.message })
  }

}



//PUT /users/:userId/cart

const updateCart = async function (req, res) {
  try {
    let userId = req.params.userId
    
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "userId is not a valid objectId" })
    }


    let data = req.body
    const { cartId, productId, removeProduct } = data

    
    if (!(removeProduct == 0 || removeProduct == 1)) {
      return res.status(400).send({ status: false, message: "removeProduct value should be either 0 or 1" })
    }

    const userDetails = await userModel.findOne({ _id: userId })
    if (!userDetails) {
      return res.status(404).send({ status: false, message: "user not exist with this userId" })
    }
    const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!productDetails) {
      return res.status(404).send({ status: false, message: "product not exist or deleted" })
    }
    const cart = await cartModel.findOne({ _id: cartId })
    if (!cart) {
      return res.status(400).send({ status: false, message: "cart is not added for this cardId, create cart first" })
    }

//copy the cart from database
let tempCart = cart;


//in = 1  and I/P = 0  remove product

//removing product from cart
tempCart.items.map(x => {
  let getIndex = tempCart.items.indexOf(x);
  if(x.productId.toString() == data.productId) {
    if(data.removeProduct == 0) {
      
      tempCart.items.splice(getIndex, 1);
      tempCart.totalPrice -= x.quantity * productDetails.price 
      
  
    }else if(data.removeProduct == 1) {
      x.quantity -= 1            //decrese the qunatity one
      tempCart.totalPrice -= productDetails.price   //Product_price - totalPice = finalPrice
    }
  }

  if(x.quantity == 0) {
    tempCart.items.splice(getIndex, 1);
    //it remove that product id index[1]
  }      
})

//updating totalPrice and totalItems
if(tempCart.items.length == 0) {
  tempCart.items = [];
  tempCart.totalItems = 0;
  tempCart.totalPrice = 0;
}else {
  tempCart.totalPrice = tempCart.totalPrice.toFixed(2);
  tempCart.totalItems = tempCart.items.length;
}


let getUpdatedCart = await cartModel.findByIdAndUpdate(
  {_id: cart._id},
  tempCart,
  {new: true}
 )


res.status(200).send({ status: true, message: "Success", data: getUpdatedCart });
}  
  catch (error) {
    return res.status(500).send({ status: false, message: error.message })
}}



//GET /users/:userId/cart
 const getCart  = async (req,res)=>{
try{

  let user_id = req.params.userId

  const user = await userModel.findById(user_id)

  let cart = await cartModel.findOne({ user_id })
     .populate('items.productId').
     select({__v:0,updatedAt:0,createdAt:0});
 
  if(!cart) return res.status(404).send({status:false,message:"Cart not Found"})

  res.status(200).send({status:true,message:`Success`,data:cart})}
   
  catch (err) {res.status(500).send({ status: false, error: err.message })}}



//DELETE /users/:userId/cart
const deleteCart = async (req,res)=>{

  try{
   const userId = req.params.userId

   const user = await userModel.findById(userId)
   
  const cart = await cartModel.findOne({userId}).select({__v:0,createdAt:0,updatedAt:0})

   if(!cart)
   return res.status(404).send({status:true,message:`Hey ${user.fname} cart does not exist.`})

   if(cart.items.length == 0)
   return res.send({status:false,message:"Your cart is Empty Alredy",data:cart})

    await cartModel.updateOne({_id:cart._id},{items:[],totalPrice:0,totalItems:0})

   res.status(204).send({status:true,message:`Hey ${user.fname} your cart is Empty now!!!`,data:cart})

  } catch (err) {
    res.status(500).send({ status: false, error: err.message })}}

export {createCart,getCart,updateCart,deleteCart}




