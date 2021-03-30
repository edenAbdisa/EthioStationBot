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
var datacache="";
getHotelList=(message)=>{
  var hotellist="";
  axios.get("https://ethio-station-api.herokuapp.com/api/hotel").
  then(response => {   
    response.data.forEach(element => {
      hotellist= hotellist+"\n"+element.id+" /"+ element.name;      
    });
    bot.sendMessage(message.chat.id,hotellist);
  })
  .catch((err) => {
    console.log(err); 
  });  
}
getHotelInfo=(message)=>{
  const hotelchoosen=message.text;
  var hotelsplitted=hotelchoosen.split('/');
  var hotelid=hotelsplitted[0].trim().parseInt();
  var hotelname=hotelsplitted[1];  
  console.log(hotelsplitted);
  console.log(hotelid);
  axios.get("https://ethio-station-api.herokuapp.com/api/hotel/"+hotelid).
  then(response => {  
    var tobeSent="Name: "+response.data.name+"\n Number of room: "+response.data.name+"\n Location: "+
              response.data.location+"\n Contact: "+response.data.contact+"\n For booking DM @hadid_adventures";
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
  var resturantsplitted=resturantchoosen.split('/');
  var resturantid=resturantsplitted[0].trim().parseInt();
  var resturantname=resturantsplitted[1];  
  console.log(resturantsplitted);
  console.log(resturantid);
  axios.get("https://ethio-station-api.herokuapp.com/api/resturant/"+resturantid).
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
  var guidesplitted=guidechoosen.split('/');
  var guideid=guidesplitted[0].trim().parseInt();
  var guidename=guidesplitted[1];  
  console.log(guidesplitted);
  console.log(guideid);
  axios.get("https://ethio-station-api.herokuapp.com/api/tourguide/"+guideid).
  then(response => {  
    var tobeSent="Name: "+response.data.name+ "\n Contact: "+response.data.contact+"\n For booking DM @hadid_adventures";
    bot.sendMessage(message.chat.id,tobeSent); 
  })
  .catch((err) => {
    console.log(err); 
  }); 
} 
bot.on('message',(message)=>{
  if(message.text.startsWith('/') && earlierAction==hotelListButton){
    getHotelInfo(message);
  }
  if(message.text.startsWith('/') && earlierAction==getResturant){
    getResturantInfo(message);
  }
  if(message.text.startsWith('/') && earlierAction==requestTourButton){
    getTourGuideInfo(message);
  }
  if(message.text===""){
  	bot.sendMessage(message.chat.id, "Message cant be empty  send /start to start");
  	return;
  }
  if (message.text && message.text === "/start"){
  	
  	bot.sendMessage(message.chat.id, "Welcome ,Press the buttons to send the message that you want."
  		, {
  			"reply_markup": {
    	                      "keyboard": [[hotelListButton, bookHotelButton],[hikingButton, registerYourHikingEvent],
                             [requestTourButton],[getResturant],[uploadPicButton],[contact]]
                        }
        });
  	return;
  }
  if(buttonTouched){
    switch(earlierAction){
      case bookHotelButton:
        choosenHotelTobeBooked= message.text;
        buttonTouched=false;
        break;
      case uploadPicButton:
        pic=message.photo[1].file_id; 
        
        break;
    }
    buttonTouched=false;
    return;
  }
  if(message.text==contact){
    bot.sendMessage(message.chat.id,"+251940121548, https://www.facebook.com/hadidadventures ");
      return;
  }
  if (message.text===hotelListButton) {
    buttonTouched=true;
    earlierAction=hotelListButton;
    getHotelList(message); 
    return;
  }  
  if (message.text===uploadPicButton) {
    buttonTouched=true;
    earlierAction=uploadPicButton;
    bot.sendMessage(message.chat.id,'Send your picture.', {
        "reply_markup": {
                            "keyboard": ["caption",[done]]
          }
        });
    return;
  }
  if (message.text===bookHotelButton) {
    buttonTouched=true;
    earlierAction=bookHotelButton;
    bot.sendMessage(message.chat.id,'DM @hadid_adventures after choosing hotel from the list');
    return;
  }
  if (message.text===requestTourButton) {
    buttonTouched=true;
    earlierAction=requestTourButton;
    getListOfTourGuide(message);
    return;
  }
 
 if (message.text===getResturant) {
    buttonTouched=true;
    earlierAction=getResturant;
    getResturantList(message);
    return;
  }

  if (message.text===done) {
     
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

 });

 
 const app = express();
 app.use(express.json());

app.listen(process.env.PORT);

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});