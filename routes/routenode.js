const {Router}=require('express')
const router=Router()


router.get('/',async(req,res)=>{

   // console.log("logout");
   // console.log(req.headers);
   // req.header('x-forwarded-for'); 

    if(req.session.ingame==true){
        res.redirect('/play');
    }
    else{ res.render('index',{
        isReg:req.session.reged,
        username:req.session.username

    })}

});


router.get('/exit',async(req,res)=>{

    req.session.destroy();
    res.redirect('/');

});
router.post('/',async(req,res)=>{
 
    if (req.session.reged!=true){

    req.session.username=req.body.userName||"unnamed";
    req.session.reged=true;
    req.session.ingame=false;
    req.session.sidID="S"+req.sessionID;
    

    }

    res.status(200).send({userName:req.session.username, color: req.session.color});

})

router.get('/play',async(req,res)=>{

    if(req.session.ingame==false){
        res.redirect('/');
    }
    else{
    res.render('gamePage',{ 

        isReg:req.session.reged,
        username:req.session.username,
        
    }) 
        
    }

})


module.exports=router