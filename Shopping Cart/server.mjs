import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import route from './src/routes/route.js'

const app = express()
const PORT = 3000
const URI = "mongodb+srv://richardwork:2YLjcp0favzUASR9@cluster3.bli4t.mongodb.net/group_32_Database?retryWrites=true&w=majority"


const upload = multer()

app.use(upload.any())

app.use(express.json())

mongoose.connect(URI)
.then(()=>console.log('MongoDb is Connected'))
.catch(err=> console.log(err))

app.use('/',route)


app.use(function(req,res){
    var err = new Error('Not Found.') 
    err.status = 400
    return res.status(400).send({status:false,message:"Path not Found."})
})

app.listen(PORT,()=>console.log(`Server Listining on ${PORT}`))