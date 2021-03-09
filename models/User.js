const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const saltRounds=10

const userSchema=mongoose.Schema({
    name:{
        type:String,
        maxlength:50
    },
    email:{
        type:String,
        trim:true,
        unique:1
    },
    password:{
        type:String,
        minlength:5
    },
    lastname:{
        type:String,
        maxlength:50
    },
    role:{
        type:Number,
        default:0
    },
    image:String,
    token:{
        type:String
    },
    tokenExp:{
        type:Number
    }
})

userSchema.pre('save',function(next){
    var user=this;
    
    //필드 중 password가 변화될 때만 dcrypt를 이용하여 암호화
    if(user.isModified('password')){    
        //비밀번호를 암호화 시킴
        bcrypt.genSalt(saltRounds,function(err,salt){
            if(err) return next(err)

            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err)
                user.password = hash    //hash된 비밀번호로 바꾸어줌
                next()  //돌아감
            })
        })
    }
})

const User=mongoose.model('User',userSchema)

module.exports={User}