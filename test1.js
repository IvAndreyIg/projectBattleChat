// Для более гибкой настройки сессий можно использовать модуль express-session

let express = require('express');
let expressSession = require('express-session');

const MongoStore = require('connect-mongo')(expressSession);
const mongoose = require('mongoose');



const connection = mongoose.createConnection('mongodb+srv://Andrey:Apassword@cluster0.r23x0.mongodb.net/todos',{
    useNewUrlParser:true,
     useFindAndModify:false,
     useUnifiedTopology: true
 });
/* let connectionOptions='mongodb+srv://Andrey:Apassword@cluster0.r23x0.mongodb.net/todos',{
    useNewUrlParser:true,
     useFindAndModify:false,
     useUnifiedTopology: true
 }; */



/* app.use(expressSession({
    secret: 'foo',
    store: new MongoStore(options)
})); */

let app = express();

let secretValue = 'secret value';
// Функция 'express-session' принимает конфигурационный объект
app.use(expressSession({
    /* name: 'sexssionId', */
    // если true, сохраняет сеанс в хранилище заново, даже если запрос не изменялся
    resave : true,
    // если установленно значение true, приложение сохраняет новые данные, даже если они не менялись
    saveUninitialized : true,
    // ключ используемый для подписания cookie файла (идентификатора сеанса)
    secret: "1" ,
    rolling: true,

    store: new MongoStore({ mongooseConnection: connection }

    
        ) ,
    cookie:{  httpOnly: true,  maxAge: 10000000000 }
}));

app.use('/', function(req, res){
   
    if(!req.session.flag){
        console.log('Set Session');
        // Записываем данные в сессию
        req.session.userName = 'Alex';
        req.session.pucname = 'puci';
        req.session.nums = Math.random();
        req.session.flag = true;
    }       
    console.log(req.session.userName);
    console.log(req.sessionID);
    console.log(req.session.nums);
    
    // удаление кукиса
    // delete req.session.userName;
    res.end();
});

app.listen(8080, function(){
    console.log('Server start on port 8080');
});

// Documentation - https://www.npmjs.com/package/express-session