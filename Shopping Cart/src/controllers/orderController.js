import userModel from '../models/userModel.js'
import orderModel from '../models/orderModel.js'
import cartModel from '../models/cartModel.js'
import { isValid,isValidObjectId } from '../utils/validation.js'

//POST /users/:userId/orders

const createOrder = async (req,res)=>{
    try{

        let userId = req.params.userId
        let data = req.body
    
     
        const user= await userModel.findById(userId)

        const cart = await cartModel.findOne({userId})

        if(!isValidObjectId(req.body.cartId))
        return res.status(404).send({status:true,message:`Hey ${user.fname}  cart-id is invalid `})


        const findCart = await cartModel.findById(req.body.cartId)
        if(!findCart)
        return res.status(404).send({status:true,message:`Hey ${user.fname}  cart doesn't exist `})

      
        let cartT = await cartModel.findOne({userId:userId})
        if(!cartT) return res.status(404).send({status:false,message:"This cart doesn't belong to u"})
     
        if(isValid(data))return res.status(404).send({status:true,message:`Hey ${user.fname} Body cant be Empty`})

        if(!cart) return res.status(404).send({status:true,message:`Hey ${user.fname} Pls create a cart before Ordering`})
        
        if(cart.items.length == 0)
        return res.status(404).send({status:true,message:`Hey ${user.fname} Your cart is Empty`})
        

            data.totalQuantity = 0
            cart.items.map(x=>{data.totalQuantity += x.quantity})
            data.userId=userId;
            data.items=cart.items;
            data.totalPrice=cart.totalPrice;
        

        const datas = await orderModel.create(data)

        let finalData = await orderModel.findById(datas._id).select({__v:0})
     
        
        //empty the cart
        await cartModel.updateOne({_id:cart._id},{items:[],totalPrice:0,totalItems:0})

        res.status(201).send({status:true,message:`Success`,data:finalData})

    }catch(err){res.status(500).send({ status: false, error: err.message })}}



    const updateOrder = async (req,res)=>{
        try{

      let userId = req.params.userId
      let data = req.body

      let{orderId,status}= data

      if(isValid(data))
      return res.status(400).send({ status: false, message: 'Data is required to cancel the order' });

      if(isValid(orderId)) return res.status(400).send({ status: false, message: 'OrderId is required '});

      if(!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: 'Enter a valid order-Id' });
     
      let cart = await cartModel.findOne({userId})
      if(!cart) 
      return res.status(400).send({status:false,message:"Cart doest exits"})

      if(!["pending", "completed", "cancelled"].includes(status)) return res.status(400).send({ status: false, message: "Order status should 'pending' or 'completed' or 'cancelled'" });
      
      let update ={}
      let order = await orderModel.findById(orderId)

      if(order.status == 'cancelled')  return res.status(400).send({ status: false, message: " Your Order has been Cancelled Already" })
      if(order.status == 'completed')  return res.status(400).send({ status: false, message: " Your Order has been completed Already" })

    if(status =='cancelled'){
    
        if(!order.cancellable) return res.status(400).send({ status: false, message: "Sorry Your Order cannnot  be Cancelled" })
       
        update.status = status

}else{
        update.status = status
     }

        let result =  await orderModel.findOneAndUpdate({orderId}, update ,{new:true})
        res.status(200).send({ status: true, message: "Success",data:result })
     


        }catch(err){res.status(500).send({ status: false, error: err.message })}}
    
export {createOrder,updateOrder} 