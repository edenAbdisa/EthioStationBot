const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios'); 
const express = require('express'); 
const { response } = require('express');
require('dotenv').config();
const API_URL="https://ethio-station-api.herokuapp.com/api/";
const token = process.env.TELEGRAM_TOKEN;
let bot;
if (process.env.NODE_ENV === 'production') {
   bot = new TelegramBot(token);
   bot.setWebHook(process.env.HEROKU_URL + bot.token);
   bot.on("polling_error", (msg) => console.log(msg));
} else {
   bot = new TelegramBot(token, { polling: true });
   bot.on("polling_error", (msg) => console.log(msg));
}
var buttonTouched=false;
var earlierAction="";
var pic;
const bookHotelButton = "Book hotel";
const hotelListButton = "Get List  of hotel";  
const hikingButton = "Get List of Hiking events";  
const requestTourButton = "Request a tour guide";  
const getResturant = "Check resturant";
const contact = "Contact Us";
const registerYourHikingEvent = "Register  your hiking event";
const done = "Done";
const uploadPicButton="Upload your tour pictures";
var picmsg;
var hikingdetail="";
var datacache="";
getHotelList=(message)=>{ 
  var hotellist="";
  axios.get("https://ethio-station-api.herokuapp.com/api/hotel").
  then(response => {   
    response.data.forEach(element => {
      hotellist= hotellist+"\n"+element.id+" /h_"+ element.name;      
    });
    bot.sendMessage(message.chat.id,hotellist);
  })
  .catch((err) => {
    console.log(err); 
  });  
}
getHotelInfo=(message)=>{
  const hotelchoosen=message.text;
  var hotelname=hotelchoosen.substr(3,);   
  console.log(hotelname); 
  axios.get("https://ethio-station-api.herokuapp.com/api/hotel/name/"+hotelname).
  then(response => {  
    var tobeSent="Name: "+response.data.name+"\nNumber of room: "+response.data.name+"\nLocation: "+
              response.data.location+"\nContact: +251940121548"+"\nFor booking DM @hadid_adventures\n"+"/bookhotel_"+response.data.name;
    bot.sendMessage(message.chat.id,tobeSent); 
  })
  .catch((err) => {
    console.log(err); 
  }); 
}
getResturantList=(message)=>{
  var resturantlist="";
  axios.get("https://ethio-station-api.herokuapp.com/api/resturant").
  then(response => {   
    response.data.forEach(element => {
      resturantlist= resturantlist+"\n"+element.id+" /"+ element.name;      
    });
    bot.sendMessage(message.chat.id,resturantlist);
  })
  .catch((err) => {
    console.log(err); 
  }); 
}
getResturantInfo=(message)=>{
  const resturantchoosen=message.text;
  var resturantname=resturantchoosen.substring(1);
  console.log(resturantname);
  axios.get("https://ethio-station-api.herokuapp.com/api/resturant/name/"+resturantname).
  then(response => {  
    var tobeSent="Name: "+response.data.name+"\n For booking DM @hadid_adventures";
    bot.sendMessage(message.chat.id,tobeSent); 
  })
  .catch((err) => {
    console.log(err); 
  }); 
}
getListOfTourGuide=(message)=>{
  var guidelist="";
  axios.get("https://ethio-station-api.herokuapp.com/api/tourguide").
  then(response => {   
    response.data.forEach(element => {
      guidelist= guidelist+"\n"+element.id+" /"+ element.name;      
    });
    bot.sendMessage(message.chat.id,hotellist);
  })
  .catch((err) => {
    console.log(err); 
  });
} 
getTourGuideInfo=(message)=>{
  const guidechoosen=message.text;
  var guidename=guidechoosen.substring(1);
  console.log(guidename);
  axios.get("https://ethio-station-api.herokuapp.com/api/tourguide/name/"+guidename).
  then(response => {  
    var tobeSent="Name: "+response.data.name+ "\n Contact: "+response.data.contact+"\n For booking DM @hadid_adventures";
    bot.sendMessage(message.chat.id,tobeSent); 
  })
  .catch((err) => {
    console.log(err); 
  }); 
} 
bot.on('message',(message)=>{
  var text= message.text; 
  var type=text[1];
  console.log(type);
  if(text.startsWith('/') && type==="h"){
    getHotelInfo(message);
  }
  if(text.startsWith('/') && type==="Resturant"){
    getResturantInfo(message);
  }
  if(text.startsWith('/') && type==="Tour Guide"){
    getTourGuideInfo(message);
  }
  var actionindex= text.search("\\_");
  var action= text.substr(0,actionindex+1);
  var itemtobebooked= text.substr(actionindex+1,);
  if(text.startsWith('/') && action==="bookhotel"){
    var tobeSent="Sender: "+message.chat.id+ " "+message.from+ "Hotel chosen"+itemtobebooked;
    bot.sendMessage("1480158007",tobeSent);
    return;
  } 
  if(text===""){
  	bot.sendMessage(message.chat.id, "Message cant be empty  send /start to start");
  	return;
  }
  if (text && text === "/start"){
  	
  	bot.sendMessage(message.chat.id, "Welcome ,Press the buttons to send the message that you want."
  		, {
  			"reply_markup": {
    	                      "keyboard": [[hotelListButton, bookHotelButton],[hikingButton, registerYourHikingEvent],
                             [requestTourButton],[getResturant],[uploadPicButton],[contact]]
                        }
        });
  	return;
  }
  if(text==contact){
    bot.sendMessage(message.chat.id,"+251940121548, https://www.facebook.com/hadidadventures ");
      return;
  }
  if (text===hotelListButton) {
    buttonTouched=true;
    earlierAction=hotelListButton;
    getHotelList(message); 
    return;
  }  
  if (text==="/uploadHikingInfo") {
    buttonTouched=true;
    earlierAction=uploadPicButton;
    bot.sendMessage(message.chat.id,"your hiking will be registered once approved by admin");
    return;
  }
  if (text===bookHotelButton) {
    buttonTouched=true;
    earlierAction=hotelListButton;
    getHotelList(message);
    return;
  }
  if (text===requestTourButton) {
    buttonTouched=true;
    earlierAction=requestTourButton;
    getListOfTourGuide(message);
    return;
  }
  if (text===registerYourHikingEvent) {
    buttonTouched=true;
    earlierAction=registerYourHikingEvent;
    bot.sendMessage(message.chat.id,"Send the name of the organizer,hiking day,location,contact,name of the person registering this event,price of the hiking. Please dont mess up the order.");
    return;
  }
 if (text===getResturant) {
    buttonTouched=true;
    earlierAction=getResturant;
    getResturantList(message);
    return;
  }
  if (text===done) {
     
    bot.sendPhoto('EthioStation',pic,{caption : '🏢  Place: '
    	 , "reply_markup": {
            "inline_keyboard": [
                [
                    {
                        text: "❤️0",
                        callback_data: 'heart'
                    },
                    {
                        text: "🔥 0",
                        callback_data: 'fire'
                    }
                ]
            ]
           }
       }
    ).then(response => {
          picmsg=response.message_id
          client.query("Insert Into PostRateNumber ( postid,fireNumber,likeNumber) values ( '" + picmsg.toString()+"', 0, 0 ) ;", (err, res) => {
            if (err) console.log("check the error"+ err); 
          
          });
    }); 
      
    
    buttonTouched=false;     
    earlierAction="";
 	choosenHotelTobeBooked=""; 
    return;
  }
  if(buttonTouched){
    switch(earlierAction){
      case registerYourHikingEvent:
        hikingdetail= message.text;
        bot.sendMessage(message.chat.id,"Send the poster.");
        buttonTouched=uploadPicButton
        break;
      case uploadPicButton:
        pic=message.photo[1].file_id;
        bot.sendMessage(message.chat.id,"Id you are done please send /uploadHikingInfo ."); 
        break;
    }
    buttonTouched=false;
    return;
  }
 });

 
 const app = express();
 app.use(express.json());

app.listen(process.env.PORT);

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});