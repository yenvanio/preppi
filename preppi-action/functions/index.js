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


// a. the action name from the make_name Dialogflow intent
  // const NAME_ACTION = 'make_name';
const LOAD_ACTION = 'load_document';
const SPEECH_ACTION = 'get_userText';
// b. the parameters that are parsed from the make_name intent
  // const COLOR_ARGUMENT = 'color';
  // const NUMBER_ARGUMENT = 'number';
const DOC_NAME_ARGUMENT = 'given-name';
const SPEECH_ARGUMENT = 'userText';

exports.preppi = functions.https.onRequest((request, response) => {
  const app = new App({request, response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));


// c. The function that generates the silly name
  function loadDocument (app) {
    let doc_name = app.getArgument(DOC_NAME_ARGUMENT);
    //let color = app.getArgument(COLOR_ARGUMENT);
    app.tell('Alright, your document name is ' +
      doc_name + ' ' +
      '! See you next time.');
  }

  function processSpeech (app) {
    let text = app.getArgument(SPEECH_ARGUMENT);
    app.tell(text);
  }

  // d. build an action map, which maps intent names to functions
  let actionMap = new Map();
  actionMap.set(LOAD_ACTION, loadDocument);
  actionMap.set(SPEECH_ACTION, processSpeech);


app.handleRequest(actionMap);
});