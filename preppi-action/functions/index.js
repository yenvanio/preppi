// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
'use strict';

process.env.DEBUG = 'actions-on-google:*';
const App = require('actions-on-google').DialogflowApp;
const functions = require('firebase-functions');
const fb_database = require('./database.js');
const text_compare = require('./textCompare.js');
const prettydiff = require("prettydiff");
const jsdom = require("jsdom");
const domtoimage = require('dom-to-image');
const { JSDOM } = jsdom;

const WELCOME_ACTION = 'input.welcome';
const LOAD_ACTION = 'load_document';
const SPEECH_ACTION = 'get_userText';
const DOC_NAME_ARGUMENT = 'given-name';
const SPEECH_ARGUMENT = 'userText';
const TEST_SPEECH_TEXT = "what is your face?";
fb_database.setupSessionsTable();

exports.preppi = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  // console.log('Request headers: ' + JSON.stringify(request.headers));
  // console.log('Request body: ' + JSON.stringify(request.body));

// This function is used to handle the welcome intent
// In Dialogflow, the Default Welcome Intent ('input.welcome' action)
  function welcomeUser (app) {
    if (app.getLastSeen()) {
      app.ask(`Hey, welcome back...`);
    } else {
      app.ask('Welcome to Preppi...');
    }
  }

  function loadDocument (app) {
    let doc_name = app.getArgument(DOC_NAME_ARGUMENT);

    fb_database.findDocName(doc_name).then(function(response){
      // TEST_SPEECH_TEXT = response;
      app.ask(response);
    });
  }

  function processSpeech (app) {
    let text = app.getArgument(SPEECH_ARGUMENT);
    let response = compareSpeech(text);
    let missedResults = text_compare.textMissed(TEST_SPEECH_TEXT, text);
    let addedResults = text_compare.textAdded(TEST_SPEECH_TEXT, text);

    app.ask(app.buildRichResponse()
      // Create a basic card and add it to the rich response
      .addSimpleResponse('Session Stats')
      .addBasicCard(app.buildBasicCard("*What You Wanted To Say*  \n" + missedResults
                                     + "  \n  -----  \n" + "*What You Said*  \n" + addedResults)
      .setTitle('Results From Current Session')
      )
    );
  }

  function compareSpeech (text) {
    if (text == TEST_SPEECH_TEXT) {
      return "Correct! Would you like to change documents?"
    }
    else {
      return "Wrong! Would you like to retry?"
    }
  }

  let actionMap = new Map();
  actionMap.set(WELCOME_ACTION, welcomeUser)
  actionMap.set(LOAD_ACTION, loadDocument);
  actionMap.set(SPEECH_ACTION, processSpeech);


app.handleRequest(actionMap);
});
