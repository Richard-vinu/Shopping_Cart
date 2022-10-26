import mongoose from 'mongoose'


  const isValid = (value) => {
    if(typeof value === "undefined" || typeof value === "null") return true;
    if(typeof value === "string" && value.trim().length == 0) return true;
    if(typeof value === "object" && Object.keys(value).length == 0) return true;
    return false; 
  }
  

const isValidBody = (reqBody) => {
  if (Object.keys(reqBody).length === 0) return true;
  return false;
} 


//usage will be (!isValidObjectId)
const isValidObjectId = (objectId) => {
  return mongoose.Types.ObjectId.isValid(objectId)} 


const isValidString = (String) => {
  return /\d/.test(String)}


//usage will be (!isValidPincode)
const isValidPincode = (num) => {
  return /^[0-9]{6}$/.test(num);}


//usage will be (!isValidEmail)
const isValidEmail = (Email) => {
  return  /^([A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{2,6})+$/.test(Email)};


//usage will be (!isValidPhone)
const isValidPhone = (Mobile) => {
  return /^[6-9]\d{9}$/.test(Mobile)};



//usage will be (!isValidPwd)
const isValidPwd = (Password) => {
    return /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/.test(Password)};




const isValidPrice = (price) => {
      return /^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(price) }



//usage will be (!isValidSize)
const isValidSize = (sizes) => {
        return ["S", "XS","M","X", "L","XXL", "XL"].includes(sizes)}

 

 //usage will be (!isValidNum)       
const isValidNum = (num) => {
        return /^[0-9]*[1-9]+$|^[1-9]+[0-9]*$/.test(num)}



export {isValid, isValidBody, isValidString, isValidPhone, isValidEmail, isValidPwd , isValidObjectId, isValidPincode, isValidPrice, isValidSize, isValidNum}