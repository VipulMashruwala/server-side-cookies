const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Users = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const config = require('./config');

exports.local = passport.use(new LocalStrategy(Users.authenticate()));
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

exports.getToken = function(user){
    return jwt.sign(user,config.secretKey,{
        expiresIn: 3600
    });
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts,
    (jwt_payload,done)=>{
        console.log("JWT payload",jwt_payload);
        Users.findOne({_id: jwt_payload._id},(err,user)=>{
            if(err){
                return done(err,false);
            }
            else if(user){
                return done(null,user);
            }
            else{
                return done(null,false);
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt',{session:false});

exports.verifyAdmin = (req,res,next)=>{
    if(req.user.admin){
        next();
    }
    else{
        var err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);
    }
}