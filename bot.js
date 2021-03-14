const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express')
const bodyParser = require('body-parser');
require('dotenv').config();

const { Client } = require('pg');
const token = process.env.TELEGRAM_TOKEN;
let bot;


 
if (process.env.NODE_ENV === 'production') {
   bot = new TelegramBot(token);
   bot.setWebHook(process.env.HEROKU_URL + bot.token);
} else {
   bot = new TelegramBot(token, { polling: true });
}
var buttonTouched=false;
var earlierAction="";
var choosenHotelTobeBooked="";
var pic;

var bookHotelButton = "Get List of hotel";
var hotelListButton = "Get List of hotel";  
var hikingButton = "Get List of Hiking events";  
var requestTourButton = "Request a tour guide";  
var getResturant = "Check resturant";
var done = "Done";
var uploadPicButton="Upload Picture";
var picmsg;
var picture;

bot.on('message',(message)=>{
	//const  message  = msg.text 
  if(message.text===""){
  	bot.sendMessage(message.chat.id, "Message cant be empty send /start to start");
  	return;
  }
  if (message.text && message.text === "/start"){
  	
  	bot.sendMessage(message.chat.id, "Welcome ,Press the buttons to send the message that you want."
  		, {
  			"reply_markup": {
    	                      "keyboard": [[$hotelListButton, $bookHotelButton],[$hikingButton], [$requestTourButton],[$getResturant],[$uploadPicButton],[$done]]
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
        buttonTouched=false;
        break;
    }
    return;
  }
  if (message.text===hotelListButton) {
    buttonTouched=true;
    earlierAction=hotelListButton;
    bot.sendMessage(message.chat.id,'SHotell one, two ');
    return;
  }  
  if (message.text===uploadPicButton) {
    buttonTouched=true;
    earlierAction=uploadPicButton;
    bot.sendMessage(message.chat.id,'Send your picture.', {
        "reply_markup": {
                            "keyboard": [$done]
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
    bot.sendMessage(message.chat.id,'Here is the resturant list');
    return;
  }

  if (message.text===done) {
     
    bot.sendPhoto('EthioStation',pic,{caption : '🏢  Place: '
    	 , "reply_markup": {
            "inline_keyboard": [
                [
                    {
                        text: "❤️ 0",
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

app.use(bodyParser.json());

app.listen(process.env.PORT);

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});