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
var choosenHotelTobeBooked="";
var pic;
var hotelList;
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
var picture;
async function contactustouched(){
  
  await axios.get("https://ethio-station-api.herokuapp.com/api/hotel").
  then(response => {
    return response.data;
     
  })
  .catch((err) => {
    console.log(err);
    return "3";
  });  
}
 getHotelList=()=>{
      var res="1";
      axios.get("https://ethio-station-api.herokuapp.com/api/hotel").
      then(function(response) {
        res=response.data;
         
      })
      .catch(function(err) {
        console.log(err);
        res="3";
      }); 
      return(res);
}
const getResturantList=()=>{
    try{
      axios({
      method: 'get',
      url:  "https://ethio-station-api.herokuapp.com/api/resturant"
    }).then((response) => {
      return response.toString();  
      }, (err) => {
        console.log(err);
        return(err.toString());
    });
    }catch(error){
    console.log(error);
    return(err.toString());
    }
    return("No List found");
}
bot.on('message',(message)=>{
  
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
      bot.sendMessage(message.chat.id,  contactustouched());
      return;
  }
  if (message.text===hotelListButton) {
    buttonTouched=true;
    earlierAction=hotelListButton;
    bot.sendMessage(message.chat.id, getHotelList());  
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
    bot.sendMessage(message.chat.id,'Choose hotel from the list bellow');
    return;
  }
  if (message.text===requestTourButton) {
    buttonTouched=true;
    earlierAction=requestTourButton;
    bot.sendMessage(message.chat.id,'Send your trip location, budget and language prefernce');
    return;
  }
 
 if (message.text===getResturant) {
    buttonTouched=true;
    earlierAction=getResturant;
    bot.sendMessage(message.chat.id,getResturantList());
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