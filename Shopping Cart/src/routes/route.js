import express from "express";
const route = express.Router()

import {register,userLogin,getUser,updateUser} from '../controllers/userController.js'
import {createProduct,getProductsById,getByFilter,updateProduct,deleteProduct} from '../controllers/productController.js'
import {createCart,updateCart,getCart,deleteCart} from "../controllers/cartController.js"
import {createOrder,updateOrder} from '../controllers/orderController.js'
import {Authn,Authz} from '../utils/auth.js'


//! Testing route
route.get('/test-me',(req,res)=>{res.json('APi fired 🎇🎇')})


//!User Apis
route.post('/register',register)
route.post('/login',userLogin)
route.get('/user/:userId/profile',Authn,Authz,getUser)
route.put('/user/:userId/profile',Authn,Authz,updateUser)



// //!Product Apis
route.post('/products',createProduct)
route.get('/products',getByFilter)
route.get('/products/:productId',getProductsById)
route.put('/products/:productId',updateProduct)
route.delete('/products/:productId',deleteProduct)


// //!Cart Apis
route.post('/users/:userId/cart',Authn,Authz,createCart)
route.put('/users/:userId/cart',Authn,Authz,updateCart)
route.get('/users/:userId/cart',Authn,Authz,getCart)
route.delete('/users/:userId/cart',Authn,Authz,deleteCart)

// //!Order Apis
// route.post('/users/:userId/orders',Authn,Authz,createOrder)
// route.put('/users/:userId/orders',Authn,Authz,updateOrder)

route.post('/users/:userId/orders',createOrder)
route.put('/users/:userId/orders',updateOrder)



    export default route