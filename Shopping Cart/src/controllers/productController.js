import productModel from '../models/productModel.js'

import {isValidBody,isValid,isValidObjectId} from "../utils/validation.js"

import uploadFile from "../utils/aws.js";

const createProduct = async function (req, res) 
{

//  (!) not 0 =1    AND (.)      OR  (+)  
//          1 =0    0 0 = 0      0 0 = 0
//                               1 0 = 1
//                  1 0 = 0
//                  0 1 = 0
//                  1 1 = 1

    try 
    {
        let data = req.body;
        let files = req.files;
      
        if (isValidBody(data)) {
            return res.status(400).send({ status: false, msg: "please provide some data" })
        }

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;



       if(!title){
           return res.status(400).send({status:false, msg:"title required..!!"})
        };


        if(isValid(title)){
             return res.status(400).send({status:false, msg:"title required..!!"})
        };

       let duplicateTitle = await productModel.findOne({title:title});

       if(duplicateTitle) {
            return res.status(400).send({status:false, msg: "title already exist in use..!!"})
       };


       
    if(!description) {
        return res.status(400).send({status:false, msg:"description required..!!"})
    };

    if(isValid(description)){
        return res.status(400).send({status:false, msg:"description required..!!"})
    };


    if(!price) {
        return res.status(400).send({status:false, msg: "price required..!!"})
    };
    if(!currencyId){ 
        return res.status(400).send({status:false, msg: "currencyId required..!!"})
    };
        
    if(!currencyFormat) {
        return res.status(400).send({status:false, msg: "currency format required..!!"})
    };

    // if(!Validation.isValidTitle(availableSizes)) {
    //     return res.status(400).send({status:false, msg: "please choose the size from the available sizes.!!"})
    // };
    if(currencyId != "INR"){
         return res.status(400).send({status:false, msg: "only indian currencyId INR accepted..!!"})
        };
    if(currencyFormat != "₹"){
         return res.status(400).send({status:false, msg: "only indian currency ₹ accepted..!!"})
        };
      
      
      
        if(!availableSizes){
            return res.status(400).send({status : false, message : "Available sizes must be provided"})
        }
        else{
            if(isValid(availableSizes)){
                return res.status(400).send({status : false, message : "please provide valid input"})
            }

            let sizes = availableSizes.toUpperCase().split(",")
            
            let arr = ["S", "XS","M","X", "L","XXL", "XL"]

            // if (!(arr)) {
            //     return res.status(400).send({status : false, message : "xyz"})
            // }

           
            data['availableSizes'] = sizes
            
        }


    if (files.length > 0) 
    {
      var  profileImages = await uploadFile(files[0]);
    }

        data.productImage = profileImages;

     //  data.availableSizes = JSON.parse(availableSizes);

        if(!data.productImage) {
            return res.status(400).send({status:false, msg: "productImage required..!!"})
        };

        if (isValid(availableSizes)) return res.status(400).send({ status: false, msg: "availableSizes feild is requried" })
        let array = availableSizes.split(",").map(x => x.trim()) //this will split the available sizes and give it an array

        for (let i = 0; i < array.length; i++) {
            if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i]))) {
                return res.status(400).send({ status: false, msg: `Available sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"].join(',')}` })
            }
        }
     
      const saveData = await productModel.create(data);


        return res.status(201).send({ status: true,message: "Success", data: saveData });
    }
    catch (err) 
    {
        console.log(err);
        return res.status(500).send({ status: false, msg: err.message }) 
    }
}



const getProductsById = async (req, res) => {
    try{
      let productId = req.params.productId;
  
      //checking is product id is valid or not
      if (!isValidObjectId(productId)){
        return res.status(400).send({ status: false, message: 'Please provide valid productId' })
      }
    
      const product = await productModel.findOne({ _id: productId, isDeleted:false})
      if(!product) return res.status(404).send({ status: false, message:"No product found"})
  
      return res.status(200).send({ status: true, message: 'Success', data: product})
    } catch (err) {
      res.status(500).send({ status: false, error: err.message })
    }
  }


  

//get data by query
const getByFilter = async (req,res)=>{
  try{
      let data = req.query 
      let filter = {
          isDeleted : false
      }
      

      let {name, size,price, priceSort, priceGreaterThan, priceLessThan} = data
      if(price){if(isValid(price))
      return res.status(400).send({status : false, messsage : "Price must have some length"})
      if(isNaN(price))
      return res.status(400).send({status : false, message : "price  must be number"})
      filter.price=price
}
      if(name){
          if(isValid(name)){
              return res.status(400).send({status : false, message : "the name is missing in length"})
          }
          
        

          filter.title = name
      }

      if(size){
          if(isValid(size)){
              return res.status(400).send({status : false, message : "the size is missing in lenght"})
          }
  
          filter.availableSizes = size.toUpperCase()
      }

     let filterData=await productModel.find(filter)
     if(filterData.length==0)
     return res.status(400).send({status:false,message:"no product found"})
      
      if(priceGreaterThan){
          if(isValid(priceGreaterThan)){
              return res.status(400).send({status : false, messsage : "Price greater than must have some length"})
          }

          if(isNaN(priceGreaterThan)){
              return res.status(400).send({status : false, message : "price greater than must be number"})
          }
          if(!filterData.length)
          filterData=await productModel.find({gte:{price:priceGreaterThan}})
          else
          filterData= filterData.filter((ele)=>ele.price>priceGreaterThan)
      }

      if(priceLessThan){
          if(isValid(priceLessThan)){
              return res.status(400).send({status : false, messsage : "priceLessThan must have some length"})
          }

          if(isNaN(priceLessThan)){
              return res.status(400).send({status : false, message : "priceLessThan must be number"})
          }
          if(!filterData.length)
          filterData=await productModel.find({$lte:{price:priceLessThan}})
          else
          filterData= filterData.filter((ele)=>ele.price<priceLessThan)
          
          
      }

     
     if(priceSort){
          if(priceSort == 1 || priceSort == -1)
              {
                if(priceSort==1){
                  filterData.sort((a,b)=>{
                    return a.price-b.price
                  })
                }
                if(priceSort==-1){
                  filterData.sort((a,b)=>{
                    return b.price-a.price
                  })
              }
            }
              else
               return res.status(400).send({status : false, message : "Price sort only takes 1 or -1 as a value" })
          
          }
          if(!filterData.length) 
          return res.status.send({status:false,message:"no such product found"})
          else
          return res.status(200).send({status:true,message:"Success",data:filterData})

  }
  catch (error) {
      console.log(error)
      return res.status(500).send({ status: false, message: error.message })      
  }
}


//update
const updateProduct = async (req, res) => {
    try {
      const productId = req.params.productId;
      
      let body = req.body;
      let { title, description,  price,style, availableSizes,installments,  isFreeShipping } = body;
  
      if (!isValidObjectId(productId))
        return res.status(400).send({ status: false, message: `${productId} is not valid objectId` });
  
      const findProduct = await productModel.findOne({
        _id: productId,
        isDeleted: false,
      });
      if (!findProduct) return res.status(404).send({ status: false, message: "Product not found"});
  
  
      const newObj ={}
  
      const files = req.files;
      if (files && files.length > 0) {
        let productImage = await uploadFile(files[0]);
        newObj.productImage = productImage;
      }
    
      if (!(body && files) )
        return res.status(400).send({ status: false, message: "Invalid Request  " });
      
        if (title || title == "") {
            if (isValid(title))
              return res.status(400).send({ status: false, message:{ status: false, message: "Please provide the title" }  });
      
               
              newObj.title = title;
          
  
        const findTitle = await productModel.findOne({ title: title });
        if (findTitle) return res.status(409).send({ status: false, message: "This title already exists" });
  
     
  
      }
      if (description || description == "") {
        if (isValid(description))
          return res.status(400).send({ status: false, message:{ status: false, message: "Please provide the description" }  });
  
      newObj.description = description;      
      }
      if (price || price == "") {
        if (isValid(price))
          return res.status(400).send({ status: false, message: "Please provide the price" });
  
        if (isNaN(Number(price)))
          return res.status(400).send({ status: false, message: "Price should be number" });
  
        if (Number(price) < 0)
          return res.status(400).send({ status: false, message: "Price should be positive" });
      newObj.price = price;      
  
      }
  
      if (style || style == "") {
        if (isValid(style))
          return res.status(400).send({ status: false, message: "Please provide style" });
        newObj.style = style;      
  
      }
      if (installments || installments == "") {
        if (isValid(installments))
          return res.status(400).send({ status: false, message: "Please provide installments" });
  
        if (isNaN(Number(installments))||!(Number.isInteger(Number(installments))))
          return res.status(400).send({ status: false, message: "Installments should be an integer" });
  
        if (Number(installments) < 0 )
          return res.status(400).send({ status: false, message: "Price should be positive" });
        newObj.installments = installments;      
      }
  
      if (isFreeShipping || isFreeShipping == "") {
        // if (!Validation.isValid(isFreeShipping))
        //   return res.status(400).send({ status: false, message: "Please provide isFreeShipping" });
  
        if (["true", "false"].indexOf(isFreeShipping) == -1)
          return res.status(400).send({ status: false, message: "IsFreeShipping value should be true or false",});
        
          newObj.isFreeShipping = isFreeShipping;      
  
      }
  
      if(availableSizes||availableSizes==''){
          if (isValid(availableSizes))
          return res.status(400).send({ status: false, message: "Please provide availableSizes" });
  
          availableSizes = JSON.parse(availableSizes);
          for (let i = 0; i < availableSizes.length; i++) {
            if (
              ["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes[i]) == -1
            )
              return res.status(400).send({ status: false, message: "invalid availableSizes selection" });
      }
      newObj.availableSizes = availableSizes;      
  
      }
  
      let updatedProduct = await productModel.findByIdAndUpdate(
        productId ,
        { $set: newObj },
        { new: true }
      );
      return res.status(200).send({ status: true, message: "Success", data: updatedProduct });
    } 
    catch (error) {
        console.log(error)
      return res.status(500).send({ status: false,message: error.message });
    }
  };

  //delete Product
  const deleteProduct = async function (req, res) {
    try {
      let id = req.params.productId;
  
      if (!isValidObjectId(id)) {
        return res.status(400).send({ status: false, message: `productId is invalid.` });
      }
  
      let findProduct = await productModel.findOne({ _id: id });
  
      if (!findProduct) {
        return res.status(404).send({ status: false, msg: "No such Product found" });
      }
  
      const alreadyDeleted= await productModel.findOne({_id: id, isDeleted: true})
  
      if(alreadyDeleted) {
        return res.status(404).send({ status: false, msg: `${alreadyDeleted.title} is already been deleted.` })
      }
  
      
      
      let data = await productModel.findOne({ _id: id });
      if (data.isDeleted == false) {
        let Update = await productModel.findOneAndUpdate(
          { _id: id },
          { isDeleted: true, deletedAt: Date() },
          { new: true }
        );
        return res.status(200).send({status: true,message: "successfully deleted the product",data:Update});
      } 
  
    } catch (err) {
        console.log(err)
      res.status(500).send({ status: false, Error: err.message });
    }
  };





export {createProduct,getProductsById,getByFilter,updateProduct,deleteProduct}