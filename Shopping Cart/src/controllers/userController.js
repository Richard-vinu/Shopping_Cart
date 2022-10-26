import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import {
  isValidBody,
  isValidString,
  isValid,
  isValidEmail,
  isValidPhone,
  isValidPwd,
  isValidPincode,
  isValidObjectId,
} from "../utils/validation.js";

import uploadFile from "../utils/aws.js";

//POST /register

const register = async (req, res) => {
  try {
    const data = req.body;
    const files = req.files;

    if (files.length == 0)
      return res
        .status(400)
        .send({ status: false, message: `profileImage is Required` });

    let { fname, lname, email, phone, password, address } = data;

    if (!fname)
      return res
        .status(400)
        .send({ status: false, message: `fname is Required` });

    if (!lname)
      return res
        .status(400)
        .send({ status: false, message: `lname is Required` });

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: `E-mail is Required` });

    if (!phone)
      return res
        .status(400)
        .send({ status: false, message: `phone is Required` });

    if (!address)
      return res
        .status(400)
        .send({ status: false, message: `Address is Required` });

    //converting  String to  Obj
    data.address = JSON.parse(data.address);

    if (isValid(data.address))
      return res.status(400).send({
        status: false,
        message:
          "Address should be in object and must contain shipping and billing addresses",
      });

    if (isValid(data.address.shipping))
      return res.status(400).send({
        status: false,
        message:
          "Shipping address should be in object and street, city and pincode is required",
      });

    if (isValid(data.address.shipping.street))
      return res.status(400).send({
        status: false,
        message: "Street is required In Shipping-address",
      });

    if (isValid(data.address.shipping.city))
      return res.status(400).send({
        status: false,
        message: "City is required In Shipping-address",
      });

    if (isValid(data.address.shipping.pincode))
      return res.status(400).send({
        status: false,
        message: "Pincode is required In Shipping-address",
      });

    if (!isValidPincode(data.address.shipping.pincode))
      return res.status(400).send({
        status: false,
        message: "Pincode is Not-valid in Shipping-address",
      });

    if (isValid(data.address.billing))
      return res.status(400).send({
        status: false,
        message:
          "Billing address should be in object and street, city and pincode is required",
      });

    if (isValid(data.address.billing.street))
      return res.status(400).send({
        status: false,
        message: "Street is required In Billing-address",
      });

    if (isValid(data.address.billing.city))
      return res.status(400).send({
        status: false,
        message: "City is required In Billing-address",
      });

    if (isValid(data.address.billing.pincode))
      return res.status(400).send({
        status: false,
        message: "Pincode is required In Billing-address",
      });

    if (!isValidPincode(data.address.billing.pincode))
      return res.status(400).send({
        status: false,
        message: "Pincode is Not-valid in Billing-address",
      });

    let uniqueEmail = await userModel.findOne({ email: email });

    if (!isValidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: `This E-mail is Invalid` });

    if (uniqueEmail)
      return res.status(400).send({
        status: false,
        message: `This E-mail has alredy registered Pls Sign In`,
      });

    let uniquePho = await userModel.findOne({ phone: phone });

    if (!isValidPhone(phone))
      return res
        .status(400)
        .send({ status: false, message: `Your Phone-no ${phone} is Invalid` });

    if (uniquePho)
      return res.status(400).send({
        status: false,
        message: `This phone-no  Already registered Pls use Diffrent Number`,
      });

    if (!isValidPwd(password))
      return res.status(400).send({
        status: false,
        message:
          "Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters",
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    data.password = hashedPassword;

    let profileImg = await uploadFile(files[0]);
    data.profileImage = profileImg;

    const finaldata = await userModel.create(data);

    res.status(201).json({
      status: true,
      message: "User created successfully",
      data: finaldata,
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};


//POST /login
const userLogin = async (req, res) => {
  try {
    const body = req.body;
    const { email, password } = body;

    if (isValidBody(body))
      return res.status(400).send({
        status: false,
        message: "Email and Password is required to login"});

    if (!email)
      return res.status(400).send({ status: false, message: "User email-id is required" });

    if (!password)
      return res .status(400) .send({ status: false, message: "User password is required" });

    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(404).send({status: false,message: "This User does not exist Please SignUp",
      });

    let comparedPswd = await bcrypt.compare(password, user.password);

    if (!comparedPswd)
      return res .status(401) .send({ status: false, message: "Incorrect Password" });

    let payload = { userId: user._id };
    let token = jwt.sign(payload, "secret-key");

    res.status(200).send({ status: true,message: "User login successfully",data: { userId: user._id, token: token },
    });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};


//GET /user/:userId/profile
const getUser = async (req, res) => {
  try {
    const user_id = req.params.userId;

    const user = await userModel.findById(user_id);

    res.status(200).send({ status: true, message: "User profile details", data: user });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};




//PUT /user/:userId/profile

let updateUser = async function (req, res) {
  try {
    let userId = req.params.userId;
    let data = req.body;
    let files = req.files;
    
    //getting the AWS-S3 link after uploading the user's profileImage
    if(files && files.length>0){
      let profileImgUrl = await uploadFile(files[0]);
      data.profileImage = profileImgUrl;
    }

    //validating the request body 
    if (isValidBody(data)) return res.status(400).send({ status: false, message: "Enter details to update your account" });

    //getting the user document
    let userProfile = await userModel.findById(userId);



   if(typeof data.fname == 'string') {
      //checking for fname
      if (isValid(data.fname)) return res.status(400).send({ status: false, message: "First name is required and should not be an empty string" });

      //validating fname
      if (isValidString(data.fname)) return res.status(400).send({ status: false, message: "Enter a valid first name and should not contain numbers" });
   }

   if(typeof data.fname == 'string') {
      if (isValid(data.lname)) return res.status(400).send({ status: false, message: "Last name is required and should not be an empty string" });

      //validating lname
      if (isValidString(data.lname)) return res.status(400).send({ status: false, message: "Enter a valid last name and should not contain numbers" });
   }

   if(typeof data.email == 'string') {
    //validating user email-id
    if (isValid(data.email)) return res.status(400).send({ status: false, message: "email is required " });

    if (!isValidEmail(data.email)) return res.status(400).send({ status: false, message: "Enter a valid email-id" });
    }


    if(typeof data.phone == 'string') {
    //validating user phone number
    if (isValid(data.phone)) return res.status(400).send({ status: false, message: "phone-number is required " });

    if ((!isValidPhone(data.phone))) return res.status(400).send({ status: false, message: "Enter a valid phone number" });
    }

    if(data.password || typeof data.password == 'string') {
    //validating user password
      if (!isValidPwd(data.password)) return res.status(400).send({ status: false, message: "Password should be 8-15 characters long and must contain one of 0-9,A-Z,a-z and special characters" });

      //hashing the password with bcrypt
      data.password = await bcrypt.hash(data.password, 10);
    }

    //checking if email already exist or not
    let checkEmail = await userModel.findOne({ email: data.email });
    if (checkEmail) return res.status(400).send({ status: false, message: "Email already exist" });

    //checking if phone number already exist or not
    let checkPhone = await userModel.findOne({ phone: data.phone });
    if (checkPhone) return res.status(400).send({ status: false, message: "Phone number already exist" });

    if(data.address) {
      //validating the address
      if (isValid(data.address)) return res.status(400).send({ status: false, message: "Address should be in object and must contain shipping and billing addresses" });

      //converting string to JSON(obj)
      data.address = JSON.parse(data.address)
      
      let tempAddress = JSON.parse(JSON.stringify(userProfile.address))

      if(data.address.shipping) {
        //validating the shipping address
        if (isValid(data.address.shipping)) return res.status(400).send({ status: false, message: "Shipping address should be in object and must contain street, city and pincode" });

        if(data.address.shipping.street){
          if (isValid(data.address.shipping.street)) return res.status(400).send({ status: false, message: "Street of shipping address should be valid and not an empty string" });

          tempAddress.shipping.street = data.address.shipping.street 
        }

        //checking for city shipping address
        if (data.address.shipping.city) {
          if (isValid(data.address.shipping.city)) return res.status(400).send({ status: false, message: "City of shipping address should be valid and not an empty string" });
          tempAddress.shipping.city = data.address.shipping.city
        }

        //checking for pincode shipping address
        if (data.address.shipping.pincode) {
          if (isValid(data.address.shipping.pincode)) return res.status(400).send({ status: false, message: "Pincode of shipping address and should not be an empty string" });

          if (!isValidString(data.address.shipping.pincode)) return res.status(400).send({ status: false, message: "Pincode should be in numbers" });

          if (!isValidPincode(data.address.shipping.pincode)) return res.status(400).send({ status: false, message: "Enter a valid pincode" });

          tempAddress.shipping.pincode = data.address.shipping.pincode;
        }
      }

      if(data.address.billing) {
        //validating the shipping address
        if (isValid(data.address.billing)) return res.status(400).send({ status: false, message: "Shipping address should be in object and must contain street, city and pincode" });

        if(data.address.billing.street){
          if (isValid(data.address.billing.street)) return res.status(400).send({ status: false, message: "Street of billing address should be valid and not an empty string" });

          tempAddress.billing.street = data.address.billing.street 
        }

        //checking for city billing address
        if (data.address.billing.city) {
          if (isValid(data.address.billing.city)) return res.status(400).send({ status: false, message: "City of billing address should be valid and not an empty string" });

          tempAddress.billing.city = data.address.billing.city
        }

        //checking for pincode billing address
        if (data.address.billing.pincode) {
          if (isValid(data.address.billing.pincode)) return res.status(400).send({ status: false, message: "Pincode of billing address and should not be an empty string" });

          if (!isValidString(data.address.billing.pincode)) return res.status(400).send({ status: false, message: "Pincode should be in numbers" });

          if (!isValidPincode(data.address.billing.pincode)) return res.status(400).send({ status: false, message: "Enter a valid pincode" });

          tempAddress.billing.pincode = data.address.billing.pincode;
        }
      }

      data.address = tempAddress;
    }

    let updateUser = await userModel.findOneAndUpdate(
      {_id: userId},
      data,
      {new: true}
    )
    res.status(200).send({ status: true, message: "User profile updated", data: updateUser });
  }catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};





export {register, userLogin, getUser, updateUser };


