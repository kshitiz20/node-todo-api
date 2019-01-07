const {UserModel}= require('./../model/user.js');
var authenticate= (req, res, next)=>{
    var token= req.header('x-auth');
    // console.log(req);
 
     console.log(token);
     UserModel.findByToken(token).then((user)=>{
         console.log(user);
         if(!user){
             res.send(401).send();
        }
        // res.send(user);
        req.user=user;
        req.token=token;
        next();
 
     }).catch((e)=>{
         res.status(401).send();
     })
}

module.exports={
    authenticate
}
