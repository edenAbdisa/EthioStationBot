const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express')
const bodyParser = require('body-parser');
require('dotenv').config();

const { Client } = require('pg');
const token = process.env.TELEGRAM_TOKEN;
let bot;


const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});
 
client.connect();


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


bot.on("callback_query", (callbackQuery) => {
	 var heartLiked=0;
	 var fireLiked=0;
   const msg = callbackQuery.message;
    const userId = callbackQuery.from.id; 
    const action = callbackQuery.data;    
    const msgId = callbackQuery.message.message_id;
    
  
    /*client.query("SELECT * FROM PostRateNumber where postId = '"+ msgId.toString() +"' ;", (err, res) => {
            if (err) throw err;            
              var postRate =JSON.parse(JSON.stringify(res.rows[0])); 

              heartLiked=parseInt(postRate.likenumber,10);
              fireLiked=parseInt(postRate.firenumber,10); 
        
    });
    if(action==="heart"){
      client.query( "SELECT * FROM LikeTable where userId= '"+ userId.toString() +"' and postId = '"+ msgId.toString() +"' ;", (err, res) => {
        if (err) throw err;
        if (res.rowCount > 0){
          client.query("Delete FROM LikeTable where userId='"+ userId.toString() +"' and postId = '"+ msgId.toString() +"' ;", (err, res) => {
            if (err) throw err;
             });
            if(heartLiked>=1){
              heartLiked--;
              bot.editMessageReplyMarkup(   { inline_keyboard:  [
                                                              [
                                                                  {
                                                                      text: `❤️  ${heartLiked}`,
                                                                      callback_data: "heart"
                                                                  },
                                                                  {
                                                                      text: `🔥 ${fireLiked}`,
                                                                      callback_data: "fire"
                                                                  }
                                                              ]
                                                            ]           
   },{"message_id":callbackQuery.message.message_id,"chat_id": '@Trial_eth_school'});
              client.query(`UPDATE PostRateNumber SET likeNumber = ${heartLiked} where postId = '`+ msgId.toString() +"';", (err, res) => {
              if (err) throw err;            
              });
            }
         
        }
        else {
          client.query("Insert Into LikeTable (id,userId,postId) values ('"+userId.toString()+msgId.toString()+"', '"+userId.toString()+"', '"+msgId.toString()+"') ;", (err, res) => {
            if (err) console.log( err);
              });
             heartLiked++;
             bot.editMessageReplyMarkup(   { inline_keyboard:  [
                                                              [
                                                                  {
                                                                      text: `❤️  ${heartLiked}`,
                                                                      callback_data: "heart"
                                                                  },
                                                                  {
                                                                      text: `🔥 ${fireLiked}`,
                                                                      callback_data: "fire"
                                                                  }
                                                              ]
                                                            ]           
   },{"message_id":callbackQuery.message.message_id,"chat_id": '@Trial_eth_school'});
            client.query(`UPDATE PostRateNumber SET likeNumber = ${heartLiked} where postId = '`+msgId.toString() +"' ;", (err, res) => {
            if (err) throw err;            
            });
        
        } 
      }); 
        
    

    
 
        
    }else if(action==="fire"){
    	client.query( "SELECT * FROM FireTable where userId= '"+ userId.toString() +"' and postId = '"+ msgId.toString() +"' ;", (err, res) => {
        if (err) throw err;
        if (res.rowCount > 0){
          client.query("Delete FROM FireTable where userId='"+ userId.toString() +"' and postId = '"+ msgId.toString() +"' ;", (err, res) => {
            if (err) throw err;            
          });
          if(fireLiked>=1){
            fireLiked--;
            bot.editMessageReplyMarkup(   { inline_keyboard:  [
                                                              [
                                                                  {
                                                                      text: `❤️  ${heartLiked}`,
                                                                      callback_data: "heart"
                                                                  },
                                                                  {
                                                                      text: `🔥 ${fireLiked}`,
                                                                      callback_data: "fire"
                                                                  }
                                                              ]
                                                            ]           
   },{"message_id":callbackQuery.message.message_id,"chat_id": '@Trial_eth_school'});
            client.query(`UPDATE PostRateNumber SET fireNumber = ${fireLiked} where postId = '`+ msgId.toString() +"';", (err, res) => {
              if (err) throw err;            
            });
          }
        }
        else {
          client.query("Insert Into FireTable (id,userId,postId) values ('"+userId.toString()+msgId.toString()+"', '"+userId.toString()+"', '"+msgId.toString()+"') ;", (err, res) => {
            if (err) throw err;
          });
          fireLiked++;          
          bot.editMessageReplyMarkup(   { inline_keyboard:  [
                                                              [
                                                                  {
                                                                      text: `❤️  ${heartLiked}`,
                                                                      callback_data: "heart"
                                                                  },
                                                                  {
                                                                      text: `🔥 ${fireLiked}`,
                                                                      callback_data: "fire"
                                                                  }
                                                              ]
                                                            ]           
   },{"message_id":callbackQuery.message.message_id,"chat_id": '@Trial_eth_school'});
          client.query(`UPDATE PostRateNumber SET fireNumber = ${fireLiked} where postId = '`+msgId.toString() +"' ;", (err, res) => {
            if (err) throw err;            
          });
        } 
      }); 
        
    }
    
   
    }); */

const app = express();

app.use(bodyParser.json());

app.listen(process.env.PORT);

app.post('/' + bot.token, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});