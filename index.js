'use strict';
const APP_SECRET = '2bc7cf31614eb14b8a4fa73ca6a51679';
const VALIDATION_TOKEN = 'BOT_NODE';
const PAGE_ACCESS_TOKEN = 'EAAGVFu56c9UBAB8zyNG0SnmrbjmJvnAFABG2ypyZAzlDE0T4sklokOtqpGLciNryZBTl1ZCmvuUnuzanlaMmIerRGu5OEkTINXq50Am1XMJj2saD3TcyNnRkgBZCdFop5w3IjhZByqGly1HNsEpWncAA7jmcFD1ZBifNFJiCewUAZDZD';

var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var router = express();

var app = express();
app.use(logger('dev'));

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
var server = http.createServer(app);
var request = require("request");

app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
});

// Đây là đoạn code để tạo Webhook
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

        let webhook_event = entry.messaging[0];

        let sender_psid = webhook_event.sender.id;

        if (webhook_event.message) {
          let text = webhook_event.message.text;
          if(text){
            let message = autoBot(text);
            sendMessage(sender_psid,message);
          }
        }
      });

    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});


// Gửi thông tin tới REST API để trả lời
function sendMessage(senderId, message) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: PAGE_ACCESS_TOKEN,
    },
    method: 'POST',
    json: {
      recipient: {
        id: senderId
      },
      message: {
        text: message
      },
    }
  });
}

function autoBot(message){
  if(message==='Hi'){
    return 'Hi, How can help you ?';
  }
  if(message%3===0 && message%5===0){
    return 'Hello Kitty ';
  }else if(message%3===0){
    return 'Hello ';
  }else if(message%5===0){
    return 'Beautiful';
  }
}

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 5000);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1");

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
});