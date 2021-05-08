let SpanID=document.querySelector("#MyRooMID");

let buttonCreateRoom=document.querySelector("#CreateRoomBut");

let connectBut=document.querySelector("#connectBut");

let inputID=document.querySelector("#textInput");
let inputUserID=document.querySelector("#inputUserID");

let controlPane=document.querySelector("#pane-control");
let greeting=document.querySelector("#greeting");
let setNameBut=document.querySelector("#setNameBut");

let userName=document.querySelector("#nameInput");

setNameBut.onclick=function(){

        console.log("puc");
        if(true){

            controlPane.style.display="";
            greeting.style.display="none";


            const xhr= new XMLHttpRequest();

            xhr.open('POST','/');

            xhr.setRequestHeader('Content-Type', 'application/json');

            
            let body={   
                userName:  userName.value 
            }

            xhr.send(JSON.stringify(body));
            
            xhr.onload=()=>{

                window.location.reload()
            }
        }
    };

    setIOCON();
function setIOCON(){
   
    const socket=io.connect();
    buttonCreateRoom.onclick=function(e){

        socket.emit('CreateRoom',{open:true});
    };
    socket.on("CreateRoomAnswer",(data)=>{
        
        SpanID.innerText="номер комнаты:"+data.roomId;
    })
    socket.on("openGamePage",(data)=>{

        window.location.replace("/play");
    })
    connectBut.onclick=function(){
        socket.emit('tryConnect',{conID:parseInt(inputID.value)
        })
    
    }

}

