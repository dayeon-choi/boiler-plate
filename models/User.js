const mongoose=require('mongoose');
const bcrypt=require('bcrypt');
const saltRounds=10
const jwt=require('jsonwebtoken');

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
                user.password = hash;    //hash된 비밀번호로 바꾸어줌
                next();  //돌아감
            })
        })
    }else{
        next();
    }
})

userSchema.methods.comparePassword=function(plainPassword,cb){
    //plainPassword 1234567 암호화된 비밀번호
    bcrypt.compare(plainPassword, this.password, function(err,isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    })
}

userSchema.methods.generateToken=function(cb){
    
    var user=this;

    //jsonwebtoken을 이용하여 token 생성
    var token = jwt.sign(user._id.toHexString(),'secretToken')
    // user._id+'secretToken' = token
    // ->
    // 'secretToken' -> user._id

    user.token=token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}

userSchema.statics.findByToken = function (token, cb){
    var user = this;

    user._id + '' = token
    //토큰을 decode 한다.
    jwt.verify(token,'secretToken',function(err,decoded){
        //유저 아이디를 이용해서 유저를 찾은 다음에 
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

        user.findOne({"_id":decoded,"token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user);
        })
    })

    jwt.verify(token,'shhhhh', function(err,decoded){
        console.log(decoded.foo)    //bar
    });
}

const User=mongoose.model('User',userSchema)

module.exports={User}