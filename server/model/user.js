const mongoose= require('mongoose');
const validator= require('validator');

const jwt=require('jsonwebtoken');
const _= require('lodash');
const bcrypt= require('bcryptjs');
var UserSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
        minlength:1,
        trim:true,
        unique: true,
        validate:{
            validator: (value)=>{
                return validator.isEmail(value);
            },
            message:`{VALUE} is not a valid Email`
            
        }
    },

    password:{
        type:String,
        required:true,
        minlength:6
    },

    tokens:[{
        access:{
            type:String,
            required:true
        },
        token:{

            type:String,
            required:true
        }
    }]
})

UserSchema.methods.toJSON= function(){
    var user =this;
    var userObject= user.toObject();

    return _.pick(userObject, ["_id","email"]);

}

UserSchema.methods.generateAuthToken= function(){
    var user= this;
    var access='auth';

    var token= jwt.sign({id: user._id.toHexString(), access}, "abc123").toString();

    user.tokens= user.tokens.concat([{access, token}]);

   return  user.save().then(user=>{
        return token;
    })
}

UserSchema.statics.findByToken=function(token){
    var decoded;
    try{

        decoded= jwt.verify(token, "abc123");
        console.log(decoded);

    }catch(e){
        return new Promise((resolve, reject)=>{
            reject();
        })
    }

    return UserModel.findOne({
         _id:decoded.id,
        "tokens.token":token,
        "tokens.access":'auth'
        });
}

//adding Encryption Middleware

UserSchema.pre('save',function(next){
    var user= this;
    console.log(user);
    if(user.isModified('password')){
        bcrypt.genSalt(10,(err,salt)=>{
            bcrypt.hash(user.password,salt, (err, hash)=>{
                console.log(hash);
                user.password=hash;
                next();
            })
        })
       
    }else{
        next();
    }
})

var UserModel= mongoose.model('UserModel', UserSchema);

module.exports={
    UserModel
}