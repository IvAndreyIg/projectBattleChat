
let MesSend=document.querySelector("#SendBut");
let textInput=document.querySelector("#textInput");
let ChatArea=document.querySelector("#ChatArea");
let svg=document.querySelector("#field1");
let field1=document.querySelector("#warField1 > div.field1 >.svgField")
let field2=document.querySelector("#warField2 > div.field1 >.svgField")
let rect2=document.querySelector("#rect2");
let hatchField1=document.querySelector("#warField1 > div.field0");
let shipField=document.querySelector("#warField1 > div.field2");
let hatchField2=document.querySelector("#warField2 > div.field0");
let stat=document.querySelector("div.steps>span");
let ships=document.querySelectorAll(".ship-count");
let shipImgs=document.querySelectorAll(".ship");
let warfield1=document.querySelector("#warField1");
let svgvoid=document.querySelector("#voidsvg");
let shipsPrepare=document.querySelector("#shipsPrepare");

let myMove=false;

let tempFieldData;
let fieldAppend=document.querySelector("#warField1 > div.field1 ");

hatchField1.ondragenter=function(t){
    t.target.style.cursor = 'copyMove';
    t.dataTransfer.dropEffect = "copyMove";
    t.preventDefault();
    var target = getCurrentTarget(t);
    target.style.backgroundColor = 'red';
    t.dataTransfer.dropEffect = 'copyMove';

return false;
}


   let scale1=0;
   let scale2=0;
   let xscale=0;
   let yscale=0;

(function(){   

    
      
    field2.onmousemove=function(e){

        if(myMove){

           scale1=field2.getBoundingClientRect().width/525;
           scale2=field2.getBoundingClientRect().height/525;
           
           
           xscale=(parseInt(((e.clientX-field2.getBoundingClientRect().left)-scale1*26)/(scale1*50)));
           yscale=(parseInt(((e.clientY-field2.getBoundingClientRect().top)-scale2*26)/(scale2*50)));
           try {
               if(tempFieldData[yscale][xscale]===0){
            rect2.style.display="";
            rect2.style.left=5+(xscale<9?xscale:xscale-xscale%9)*9.5+"%";
            rect2.style.top=5+(yscale<9?yscale:yscale-yscale%9)*9.40+"%";
            }else{
                rect2.style.display="none";
           }
           } catch (error) {
               rect2.style.display="none";
           }
           }else{
            rect2.style.display="none";
       }
      
    }
   
let socket=io.connect();
    
    
field2.onclick=function(e){
    if(myMove){
    socket.emit('sendMove',{x:xscale,y:yscale});
    }
}
    


    socket.on("updateALL",(data)=>{
     
        tempFieldData=data.hetchField2;
        hatchField1.textContent = '';
        hatchField2.textContent = '';
        shipField.textContent='';
        ChatArea.value=data.ChatText ;
        
        if(!data.userReady){
        for(let t=0;t<4;t++){
            ships[t].innerHTML=data.ships[t];
        }
        stat.innerHTML="Расставте корабли";

        }else{
            shipsPrepare.style.display="none";

            if(data.allReady){
               
                if(data.gameStatus==2){
                    
                    stat.style.color="rgba(20, 150, 15, 0.9)"
                    if(data.movepose===data.usersnames[0]){
                       stat.innerHTML="Вы победили"; 
                    }
                    else{
                        stat.innerHTML="Победил игрок "+data.movepose; 
                    }
                    
                    myMove=false;

                    setTimeout(() => {
                        window.location.pathname = '/'
                    }, 15000);

                }else{
                stat.style.color="rgba(20, 150, 15, 0.9)"
                stat.innerHTML="ход игрока "+data.movepose;
                myMove=data.movepose===data.usersnames[0];

                }
            }
            else{
                stat.style.color="rgba(200, 100, 0, 0.9)"
                stat.innerHTML="ожидание игрока "+data.usersnames[1];
            }


        }
        for(let i=0;i<10;i++){
            for(let j=0;j<10;j++){
                if(data.hetchField1[i][j]===-1){
                hatchField1.append(getSVGHatch(i,j));
                }
                if(data.hetchField1[i][j]===-2){
                hatchField1.append(getSVGCross(i,j));
                }
                if(data.hetchField1[i][j]===-3){
                hatchField1.append(getSVGBoom(i,j));
                }
    
            }    

        }
        for(let i=0;i<10;i++){
            for(let j=0;j<10;j++){
                if(data.hetchField2[i][j]===-1){
                hatchField2.append(getSVGHatch(i,j));
                }
                if(data.hetchField2[i][j]===-2){
                hatchField2.append(getSVGCross(i,j));
                }
                if(data.hetchField2[i][j]===-3){
                hatchField2.append(getSVGBoom(i,j));
                }
            }    

        }

        for(let i=1;i<data.shipsMap.length;i++){
            let ship=data.shipsMap[i];
        
            shipField.append(getSVGShip(ship.y,ship.x,ship.type,ship.direction));
        }


    })

    socket.emit('updateMeChat',{});
  

    socket.emit('giveUserData',{conID:parseInt(document.userID),
        userName:document.userName
    
    });

    
    document.func1=function(){
        socket.emit('sendShipSet',{x:3,y:4,type:3, direction:1
 
        });
    }

    MesSend.onclick=function(){

        socket.emit('sendMessage',{message:textInput.value});
        textInput.value="";

    };

    for(let t=0;t<4;t++){
        shipImgs[t].ondragstart=takeShip;
     
        document.ondragend=dragendShip;
        
    }
   
   let Interval= setInterval(function(){
        let textInput=document.querySelectorAll(".S3");

    },2000);



    field1.ondragover=draggingOverShip;

    warfield1.ondrop=function(e){
        let scale1=field1.getBoundingClientRect().width/525;
       let scale2=field1.getBoundingClientRect().height/525;
      let xscale=(parseInt(((e.clientX-field1.getBoundingClientRect().left)-scale1*26)/(scale1*50)));
      let yscale=(parseInt(((e.clientY-field1.getBoundingClientRect().top)-scale2*26)/(scale2*50)));
  
          e.preventDefault();
          
          let data = e.dataTransfer.getData("text");

          e.dataTransfer.clearData();
   
          socket.emit('sendShipSet',{
               x:xscale,
               y:yscale,
               type:e.dataTransfer.getData("text"),
               direction:e.getModifierState("Shift")?1:0
           });
   
      }

})();

let getSVGHatch=(x=> {
    let temp;


   return function getSVG(top=0,left=0){
       if(temp==undefined){
        temp = document.createElement("img");

    
        temp.setAttribute("alt", "image description");
        temp.setAttribute("src","/hatch.svg");
        temp.setAttribute("class","hatch-img");
           
        }
        temp.style.top=`${5.1+9.4*top}%`;
        temp.style.left=`${5.1+9.5*left}%`;
        return temp.cloneNode(true);//
    }
    
})();

let getSVGCross=(x=> {
    let temp;


   return function getSVG(top=0,left=0){
       if(temp==undefined){
        temp = document.createElement("img");

    
        temp.setAttribute("alt", "image description");
        temp.setAttribute("src","/cross.svg");
        temp.setAttribute("class","hatch-img");
           
        }
        temp.style.top=`${5.1+9.4*top}%`;
        temp.style.left=`${5.1+9.5*left}%`;
        return temp.cloneNode(true);//
    }
    
})();

let getSVGBoom=(x=> {
    let temp;

   return function getSVG(top=0,left=0){
       if(temp==undefined){
        temp = document.createElement("img");

    
        temp.setAttribute("alt", "image description");
        temp.setAttribute("src","/boom.png");
        temp.setAttribute("class","boom-img");
           
        }
        temp.style.top=`${5.1+9.4*top}%`;
        temp.style.left=`${5.1+9.5*left}%`;
        return temp.cloneNode(true);//
    }
    
})();

let getSVGShip=(x=> {
    let temp;


   return function getSVG(top=0,left=0,type,direction){
       if(temp==undefined){
        temp = document.createElement("img");

    
        temp.setAttribute("alt", "image description");
       
        }
        if(direction){
            temp.setAttribute("class","ship-img goodTrans"+type);
        }
        else{
            temp.setAttribute("class","ship-img");
        }
        temp.setAttribute("src","/ships/ship"+type+".svg");
        temp.style.top=`${5.1+9.4*top}%`;
        temp.style.left=`${5.1+9.5*left}%`;
        return temp.cloneNode(true);//
    }
    
})();

let tempDrag;


    async function takeShip (e) {
   
            trans=e.dataTransfer;
            e.dataTransfer.setData("text/plain", e.target.alt);

          tempDrag=document.querySelector(".shipsUl").childNodes[e.target.alt*2-1].childNodes[1].cloneNode(true);
          tempDrag.setAttribute("class","");
          tempDrag.style.width="9.1%";
          tempDrag.style.height="auto";
          tempDrag.style.opacity="0.9";
          tempDrag.style.position="absolute";
          tempDrag.style.display="none";     

            let temp=e.target.alt-1;

            fieldAppend.append(tempDrag);

            e.dataTransfer.setDragImage(svgvoid, 1, 1);


                document.puci=e.dataTransfer;

    };

let Timer;

    function draggingOverShip (e) {
    


        if (e.getModifierState("Shift")) {
        tempDrag.setAttribute("class","trans");
        }
        else{
            tempDrag.setAttribute("class","");
        }
    tempDrag.style.display="";

            try {
                clearTimeout(Timer);
                
            } catch (error) {
                
            }
            Timer=setTimeout(() => {
                tempDrag.style.display="none";
            }, 150);
   
        tempDrag.style.left=e.clientX-field1.getBoundingClientRect().left+3+"px";
        tempDrag.style.top=e.clientY-field1.getBoundingClientRect().top+3+"px";

        };

    function dragendShip (e){

        tempDrag.remove();
    };


warfield1.ondragover=function(e){
 e.preventDefault();

    e.dataTransfer.dropEffect = "copy";

    return false;
}
