function test() {
  Logger.log("hi there");
  }

function doGet(e) {
  var proxy = e.parameter.email;
  if (proxy) {
    var user = proxy;
    } else {
      var user = Session.getActiveUser().getEmail();
      };
  if (user == "YOUR EMAIL GOES HERE") {
    var userType = "instructor";
    } else {
      var userType = "student";
      };
 
  
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var sheet = ss.getSheetByName("roster");
  var data = sheet.getDataRange().getValues();
  data.shift();
  var emails = data.map(r => r[0]);
  var index = emails.indexOf(user);
  if (index == -1) {
    return HtmlService.createHtmlOutput("Sorry, you're not in this class");
    };
    
  // here I'm going to log the person as "present"
  // then later I'll pull in the present and make sure that they
  // are shown differently somehow in the roster list
  
  var presentsheet = ss.getSheetByName("present");
  presentsheet.appendRow([index]);
  var presentdata = presentsheet.getDataRange().getValues();
  presentdata=presentdata.map(r=>r[0]);
  sendToPusher("present", {"index":index});
  
  // get past chats
  var chatsheet = ss.getSheetByName("chats");
  var chats = chatsheet.getDataRange().getValues();
  chats.reverse();
  var previouschats = chats.map(r=>r[0]).join("<br/>");
  //previouschats.reverse();
  var queues = getQueues();
  var newqueue = queues["newqueue"];
  var followupqueue = queues["followupqueue"];
  
  var t=HtmlService.createTemplateFromFile("main");
  t.index = index;
  t.user = user;
  t.names = data.map(r => r[1]);
  t.name = data[index][1];
  t.userType = userType;
  t.roster = rosterList(data, presentdata);
  t.chats = previouschats;
  t.newqueue = newqueue;
  t.buttons = getButtons();
  t.followupqueue = followupqueue;
  return t.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
function getButtons() {
  var sheet=SpreadsheetApp.getActive().getSheetByName("emotions");
  var data = sheet.getDataRange().getValues();
  var html = data.map(r => `<button onClick="update('${r[0]}', '${r[1]}')" style="color:${r[1]}">${r[0]}</button>`).join("\n");
  return html;
  }
  
function getQueues() {
  var handssheet=SpreadsheetApp.getActive().getSheetByName("raised hands");
  var lowersheet = SpreadsheetApp.getActive().getSheetByName("lowered");
  var transfersheet = SpreadsheetApp.getActive().getSheetByName("transfers");
  var hands = handssheet.getDataRange().getValues();
  var lowered = lowersheet.getDataRange().getValues();
  var transfers = transfersheet.getDataRange().getValues();
  var lowereddates = lowered.map(r => r[1]);
  var leftover = hands.filter(r => !(lowereddates.includes(r[2])));
  leftover=leftover.map(r=>seeIfTransferred(r, transfers));
  var newqueue = leftover.filter(r => r[0]=="newqueue").map(h => {return {"index":h[1],"d":h[2]}});
  var followupqueue = leftover.filter(r => r[0]=="followupqueue").map(h => {return {"index":h[1], "d":h[2]}});
  return {"newqueue":newqueue, "followupqueue":followupqueue};
  }
  
function seeIfTransferred(hand, transfers) {
  var trans = transfers.filter(h => h[1]==hand[2]);
  if (trans.length > 0) {
    //it's been transferred at least once
    var last = trans[trans.length - 1];
    return [last[3],hand[1],hand[2]];
    } else {
      return hand;
      };
  }

function update(button) {
  var user = Session.getActiveUser().getEmail();
  var sheet = SpreadsheetApp.getActive().getSheetByName("responses");
  var d = new Date();
  sheet.appendRow([d, button, user]);
  }

function broadcast(id, button,color) {
  if (button == "Clear") {
    var b = "";
    } else {
      var b=button;
      };
  sendToPusher("reaction", {"id":id, "button":b, "color":color});
  }
  
function addChat(id, text) {
  sendToPusher("chat", {"id":id, "text":text});
  var user = Session.getActiveUser().getEmail();
  var sheet = SpreadsheetApp.getActive().getSheetByName("chats");
  sheet.appendRow([text]);
  }
  
function pusherRaise(queuename, index) {
  var d = new Date().getTime();
  sendToPusher("raise", {"queuename":queuename, "hand":{"index":index, "d":d}});
  var sheet = SpreadsheetApp.getActive().getSheetByName("raised hands");
  sheet.appendRow([queuename, index, d]);
  }
  
function pusherRemove(queuename, hand, byinstructor) {
  sendToPusher("remove", {"queuename":queuename, "hand":hand});
  var sheet = SpreadsheetApp.getActive().getSheetByName("lowered");
  var d = new Date().getTime();
  sheet.appendRow([hand.index, hand.d,d,byinstructor]);
  /*
  
  Note that you have to pass the hands around, not just the indices
  because the clients might get screwed up. If they do, they might
  delete the wrong things.
  
  So if the hands are passed around, you'll need a client function
  that takes a queuename and a hand and determines it's index. 
  Then everything else should work, I guess.
  
  window[queuename].indexOf(hand) would work, I guess.
  
  */
//  sheet.appendRow([queuename, index, d]);
  }
  
function pusherTransfer(queuename, hand) {
  sendToPusher("transfer", {"queuename":queuename, "hand":hand});
  var sheet = SpreadsheetApp.getActive().getSheetByName("transfers");
  var d = new Date().getTime();
  var fix = {"followupqueue": "newqueue", "newqueue": "followupqueue"};
  sheet.appendRow([hand.index, hand.d,d, fix[queuename]]);
  }
  
function rosterList(data, presentdata) {
  var html = "";
  data.map((r,i) => {
    html+=`<span id="${i}"`;
    if (!(presentdata.includes(i))) {
      html+=` style="color: Gray"`;
      };
    html+=`>${r[1]}</span> `;
    return html;
    });
  return html;
  }
