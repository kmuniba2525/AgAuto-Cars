import mongoose from 'mongoose';
// we are making the schema here 
const userSchema= new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true,unique:true},
    password:{type:String, required:true},
    cartItems:{type:Object, default:{}},
    
},{minimize:false});
// now we wil make a model using this schema

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User 