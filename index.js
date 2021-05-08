const { getTempARR } = require('./game_modules/fieldsArrays');
const express=require('express'),
 expressSession = require('express-session'),
 socketio=require("socket.io"),
 router=require("./routes/routenode"),
 config=require("./config/config"),
 bodyParser = require('body-parser'),
 cookie = require('cookie'),
 cookieParser = require('cookie-parser'),
 MongoStore = require('connect-mongo')(expressSession),
 mongoose = require('mongoose'),
 connection = mongoose.createConnection(config.mongoose.uri,{
    useNewUrlParser:true,
     useFindAndModify:false,
     useUnifiedTopology: true
 });

let Rooms=new Map();
let gameDates=new Map();
let conUsers=new Map();
let socketsMap=new Map();

const path=require('path')
const exphbs=require('express-handlebars');
const PORT=process.env.PORT||config.port
const COOKIE_SECRET = 'secret';
const COOKIE_ID_NAME = 'sid';
const sessionStore=new MongoStore({ mongooseConnection: connection });

const app=express();


const hbs =exphbs.create(
    {
        defaultLayout:'main',
        extname:'hbs'
    }
)

app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'staticFolder')));
app.use(cookieParser(COOKIE_SECRET));
app.use(expressSession({

    resave : true,
 
    saveUninitialized : true,

    name: COOKIE_ID_NAME,

    secret: COOKIE_SECRET ,

    rolling: true,

    store: sessionStore,

    cookie:{  httpOnly: false,  maxAge: 10000000000 }
}));


app.engine('hbs',hbs.engine)
app.set('view engine','hbs')
app.set('views', 'viewsFolder'); 


app.use(router);


function startServer(){
    try {
        
        let server=  app.listen(PORT,()=>{

            
        })

        const io=socketio(server);

        io.on('connection',(socket)=>{


                    getSession(socket).then((result=>{

                                
                                if(result.sidID!=undefined){
                                            
                                            if(socketsMap.get(result.sidID)==undefined){
                                            
                                            socketsMap.set(result.sidID,new Set([socket]))
                                             
                                            }
                                            else{
                                            
                                            socketsMap.get(result.sidID).add(socket);
                                        
                                            }
                                } 

                                if(result.ingame==true){
                                    socket.on('sendMessage',(data)=>{


                                    getSession(socket).then(result=> 


                                    gameDates.get(result.gameData).giveChatMes(data.message,result)

                                    )

                                    })
                                    
                                    socket.on('sendMove',(data)=>{


                                        try {
                                            

                                            getSession(socket).then(result=> 
        

                                            gameDates.get(result.gameData).processPlayerStep(data.x,data.y,result)
        
                                            )

                                        } catch (error) {
                                            
                                        }
                                        
    
                                        })
                                        socket.on('sendShipSet',(data)=>{


                                            getSession(socket).then(result=> 
        
                                            gameDates.get(result.gameData).
                                                processPlayerSetShip(result,data.x,data.y,data.type, data.direction)
                                            )
        
                                            })

                                    
                                    getSession(socket).then(result=> {
                                        try {
                                            gameDates.get(result.gameData).refreshChatThisSoc(socket);
                                        } catch (error) {
                     
                                        }
                         
                                    }

                                    )
                            
                                }
                    }))
                

            socket.username="default";


            socket.on('disconnect', (reason) => {

                getSession(socket).then((result=>{


                    if(result.sidID!=undefined){
                              
                                try {
                                    if(socketsMap.get(result.sidID))
                                    socketsMap.get(result.sidID).delete(socket);
                                } catch (error) {
                                    console.log(error);
                                }
  
                        } 

                 }))
              });

            socket.on('CreateRoom',(data)=>{

                const newID=Math.floor(10000+Math.random()*90000);
             
                        Rooms.set(newID,getSidSes(socket));


                socket.emit('CreateRoomAnswer',{roomId:newID});
            })

            socket.on('tryConnect',(data)=>{
                
               if(true){
                let newID=Math.floor(10000+Math.random()*9000)

               let gameRoom= new GameData(Rooms.get(data.conID),getSidSes(socket),io);
              
               gameDates.set(newID,gameRoom);
               
               setSession({ingame:true,gameData:newID,queuePos:0},null,Rooms.get(data.conID));
               setSession({ingame:true,gameData:newID,queuePos:1},socket);
                getSession(null,Rooms.get(data.conID)).then((result=>{

                    for (let valueSOC of socketsMap.get(result.sidID)){ 
                        valueSOC.emit('openGamePage',{});
                }
                
                }))
                getSession(socket).then((result2=>{

                   for (let valueSOC of socketsMap.get(result2.sidID)){ 
                       valueSOC.emit('openGamePage',{});
                   }
                   
                   })).then((result=>{
       
                   }))
         
              }
            })
            
            socket.on('giveUserData',(data)=>{
                
                            conUsers.set(data.conID,[socket,data.userName]);

            })

        })

    } catch (error) {
        console.log(error);
    }
}

startServer();









class GameData {

    constructor(firstUserSessionID,secondUserSessionID,serverIO) {
 
        this.gameStatus=1;

        
        this.users=[new playerData(firstUserSessionID),new playerData(secondUserSessionID)];
        
        this.ChatText="Начало игры";
        this.whoseMove=0;
        this.allReady=false;
 
    };

    giveChatMes(data,session){


        this.ChatText+="\n"+(new Date().toISOString().match(/(\d{2}:){2}\d{2}/)[0])+
        " "+session.username+":  "+data;
  
        this.sendMesToSockets(this.ChatText);
 
    }

    processPlayerSetShip(session,x,y,type, direction)
    { 

        if(!this.allReady)
        try {
            console.log(this.users[session.queuePos].trySetShip(x,y,type, direction));
        } catch (error) {
            console.log(error);
        }
        finally{
            this.sendMesToSockets(this.ChatText);

            if(this.users[0].userReady&&this.users[1].userReady){

                this.allReady=true;
            }
        }
   
       
    }

    processPlayerStep(x,y,session)
    { 

        if(session.queuePos===this.whoseMove&&this.gameStatus==1){
            let temp=Math.abs(this.whoseMove-1);
     
            if(this.users[temp].userShipsIndexes[y][x]>0){

               let ship= this.users[temp].userShipsMap[this.users[temp].userShipsIndexes[y][x]];

                if(ship.type==='1'){

                    this.users[temp].userHetchField[y+1][x]=-1;
                    this.users[temp].userHetchField[y-1][x]=-1;
                    this.users[temp].userHetchField[y][x+1]=-1;
                    this.users[temp].userHetchField[y][x-1]=-1;
                    this.users[temp].userHetchField[y-1][x-1]=-1;
                    this.users[temp].userHetchField[y+1][x+1]=-1;
                    this.users[temp].userHetchField[y-1][x+1]=-1;
                    this.users[temp].userHetchField[y+1][x-1]=-1;
                    this.users[temp].userHetchField[y][x]=-3;
    
                    this.users[temp].destroyedShips++
                        console.log("SHIPPS IS NOW ");
                        console.log(this.users[temp].destroyedShips);

                        if(this.users[temp].destroyedShips===10){
                            console.log("GAME OVER");
                            this.gameStatus=2;
                            this.sendMesToSockets(this.ChatText);
                            setTimeout(() => {
                                this.clearALL();
                            }, 100); 
                        }
                }
                else{

                    let ship=this.users[temp].userShipsMap[this.users[temp].userShipsIndexes[y][x]]

                    ship.damage++;

                    if(ship.damage==ship.type){
                        let tempY;
                        let tempX;

                        for(let i=0;i<ship.type;i++){
                            tempY=ship.y+Math.abs(ship.direction-1)*i;
                            tempX=ship.x+ship.direction*i;
                            this.users[temp].userHetchField[tempY+1][tempX]=-1;
                            this.users[temp].userHetchField[tempY-1][tempX]=-1;
                            this.users[temp].userHetchField[tempY][tempX+1]=-1;
                            this.users[temp].userHetchField[tempY][tempX-1]=-1;
                            this.users[temp].userHetchField[tempY-1][tempX-1]=-1;
                            this.users[temp].userHetchField[tempY+1][tempX+1]=-1;
                            this.users[temp].userHetchField[tempY-1][tempX+1]=-1;
                            this.users[temp].userHetchField[tempY+1][tempX-1]=-1;
                        }
                        for(let i=0;i<ship.type;i++){
                            tempY=ship.y+Math.abs(ship.direction-1)*i;
                            tempX=ship.x+ship.direction*i;
                            this.users[temp].userHetchField[tempY][tempX]=-3;
                           
                        }

                        this.users[temp].destroyedShips++
                        
                        if(this.users[temp].destroyedShips===10){
                            
                            this.gameStatus=2;
                            this.sendMesToSockets(this.ChatText);
                            setTimeout(() => {
                                this.clearALL();
                            }, 100);
                            
                        }
                    }
                    else{
                        this.users[temp].userHetchField[y][x]=-2;
                    }
                }
        
            }else if(this.users[temp].userHetchField[y][x]==0){
                
                this.users[temp].userHetchField[y][x]=-1;
                this.whoseMove=temp;
            }
            
            this.sendMesToSockets(this.ChatText);
        }
        else{
        }
    }
    clearALL(){
        this.sendMesToSockets(this.ChatText+"\nИгра окончена!");

        setTimeout(() => {
            setSession({ingame:false,gameData:null,queuePos:null},null,this.users[0].userSessionID);
        setSession({ingame:false,gameData:null,queuePos:null},null,this.users[1].userSessionID);
        }, 500);
  
    }
    
    refreshChatThisSoc(socket){

        getSession(socket).then((result=>{

                socket.emit('updateALL',{
                    ChatText:this.ChatText,
                    hetchField1:this.users[result.queuePos].userHetchField,
                    hetchField2:this.users[Math.abs( result.queuePos-1)].userHetchField,
                    ships:this.users[result.queuePos].ships,
                    shipsMap:this.users[result.queuePos].userShipsMap,
                    userReady:this.users[result.queuePos].userReady,
                    allReady:this.allReady,
                    usersnames:[this.users[result.queuePos].username,this.users[Math.abs( result.queuePos-1)].username],
                    gameStatus:this.gameStatus

                });
         
        }) )

    }

    sendMesToSockets(massege){

        for(let t=0;t<2;t++){

            getSession(null,this.users[t].userSessionID).then((result=>{

             for (let valueSOC of socketsMap.get(result.sidID)){ 
                valueSOC.emit('updateALL',{
                    ChatText:massege,
                    hetchField1:this.users[t].userHetchField,
                    hetchField2:this.users[Math.abs(t-1)].userHetchField,
                    ships:this.users[t].ships,
                    shipsMap:this.users[t].userShipsMap,
                    userReady:this.users[t].userReady,
                    allReady:this.allReady,
                    usersnames:[this.users[t].username,this.users[Math.abs(t-1)].username],
                    movepose:this.users[this.whoseMove].username,
                    gameStatus:this.gameStatus
                });

            }
         }) )
        }

    }
 
  }



class playerData{
        constructor(ID,name){
            this.userSessionID=ID;
            this.ships=[4,3,2,1];
            this.destroyedShips=0;
            this.userHetchField=[ ...getTempARR()];
            this.userShipsMap=[null];
            this.userShipsIndexes=[...getTempARR()];
            this.userShipsIndexes[-1]=[0,0,0,0,0,0,0,0,0,0];
            this.userHetchField[-1]=[0,0,0,0,0,0,0,0,0,0];
            this.userReady=false;

            getSession(null,ID).then((result=>{

                this.username=result.username;
      
            }));
            
        }

        trySetShip(x,y,type, direction){

            let tempY;
            let tempX;

            try {
                if(this.ships[type-1]>0){
 
                for(let i=0;i<type;i++){
                    tempY=y+Math.abs(direction-1)*i;
                    tempX=x+direction*i;

                    if(
                    (this.userShipsIndexes[tempY][tempX]<=0||this.userShipsIndexes[tempY][tempX]==undefined)&&
                    (this.userShipsIndexes[tempY+1][tempX]<=0||this.userShipsIndexes[tempY+1][tempX]==undefined)&&
                    (this.userShipsIndexes[tempY-1][tempX]<=0||this.userShipsIndexes[tempY-1][tempX]==undefined)&&
                    (this.userShipsIndexes[tempY][tempX+1]<=0||this.userShipsIndexes[tempY][tempX+1]==undefined)&&
                    (this.userShipsIndexes[tempY][tempX-1]<=0||this.userShipsIndexes[tempY][tempX-1]==undefined)&&
                    (this.userShipsIndexes[tempY-1][tempX-1]<=0||this.userShipsIndexes[tempY-1][tempX-1]==undefined)&&
                    (this.userShipsIndexes[tempY+1][tempX+1]<=0||this.userShipsIndexes[tempY+1][tempX+1]==undefined)&&
                    (this.userShipsIndexes[tempY-1][tempX+1]<=0||this.userShipsIndexes[tempY-1][tempX+1]==undefined)&&
                    (this.userShipsIndexes[tempY+1][tempX-1]<=0||this.userShipsIndexes[tempY+1][tempX-1]==undefined)
                    ){

                    }    
                    else{

                        return Error(`x${tempX}+y${tempY}`);
                    }

                }

                let order=this.userShipsMap.push({x,y,type,direction,damage:0})-1;
                for(let i=0;i<type;i++){
                    tempY=y+Math.abs(direction-1)*i;
                    tempX=x+direction*i;
                    
                    this.userShipsIndexes[tempY+1][tempX]=-1;
                    this.userShipsIndexes[tempY-1][tempX]=-1;
                    this.userShipsIndexes[tempY][tempX+1]=-1;
                    this.userShipsIndexes[tempY][tempX-1]=-1;
                    this.userShipsIndexes[tempY-1][tempX-1]=-1;
                    this.userShipsIndexes[tempY+1][tempX+1]=-1;
                    this.userShipsIndexes[tempY-1][tempX+1]=-1;
                    this.userShipsIndexes[tempY+1][tempX-1]=-1;
                    
                }
                for(let i=0;i<type;i++){
                    tempY=y+Math.abs(direction-1)*i;
                    tempX=x+direction*i;
                    this.userShipsIndexes[tempY][tempX]=order;
                
                }
                this.ships[type-1]--;

                if(this.ships[0]===0&&this.ships[1]===0&&this.ships[2]===0&&this.ships[3]===0){
                    this.userReady=true;
                    this.ships=null;
                }
            }
            } catch (error) {

                return error;
            }
            
        }
}

  function getSidSes(socket){

    try{
        return cookieParser.signedCookie(cookie.parse(socket.handshake.headers.cookie)[COOKIE_ID_NAME], COOKIE_SECRET);
    } catch (err) {
        new Error('Internal server error');
    }
};
  function getSession(socket,sidSes){

    try{
        
        let sid = sidSes||cookieParser.signedCookie(cookie.parse(socket.handshake.headers.cookie)[COOKIE_ID_NAME], COOKIE_SECRET);
        if (! sid) {
            return new Error('Cookie signature is not valid');
        }
           return sessionStore.get(sid, (err, session)=> {
        if (err) return err;
        if (! session) return new Error('session not found');
  
        return session;
        }
        );

    } catch (err) {

        new Error('Internal server error');
    }
};


function setSession(data,socket,sidSes){

    try{

        let sid = sidSes||cookieParser.signedCookie(cookie.parse(socket.handshake.headers.cookie)[COOKIE_ID_NAME], COOKIE_SECRET);

     
        if (! sid) {
            return new Error('Cookie signature is not valid');
        }
  
        sessionStore.get(sid, (err, session)=> {
        if (err) return err;
        if (! session) return new Error('session not found');

        return session;
        }
        ).then((result=>{

            if((typeof data)=="object"){
                Object.assign(result, data);
       
                sessionStore.set(sid,result,(err)=>{if (err) return err;}).then((res,reg)=>{
            
                })

                }     
        }))

    } catch (err) {
        console.error(err.stack);
        
    }
};





