import jwt from 'jsonwebtoken'
import {isValidObjectId} from '../utils/validation.js'
import userModel from '../models/userModel.js'
import cartModel from '../models/cartModel.js'

const Authn = async (req,res,next)=>{
    try {

        let bearer = req.headers.authorization
        if(!bearer) return res.status(400).send({ status: false, message: "Please, provide the token" });
 
        let token = bearer.split(' ')
     
       let decodedToken = jwt.verify(token[1],'secret-key')
      
       req.token = decodedToken

       if(!decodedToken) return res.status(401).send({status: false, message: "You are Unauthorized"})
        
    next()
    }
    catch(error){
        if(error.message == 'invalid signature')
        return res.status(401).send({status:false, message:"Invalid Token"})
        res.status(500).send({status:false,message:error.message})}

}


const Authz= async (req,res,next)=>{
    try {

        let user_id = req.params.userId

        if(!isValidObjectId(user_id))
          return res.status(400).send({status:false,message:"Invalid-userId"})

    let userID = await userModel.findById(user_id)

    if(!userID) return res.status(404).send({status:false,message:"This user user doesn't exist"})

    if(req.token.userId != user_id) return res.status(403).send({status: false, message: "Forbidden You don't have Access"})
    
    next()

    } catch(error){res.status(500).send({status:false,message:error.message})}

}

export {Authn,Authz}