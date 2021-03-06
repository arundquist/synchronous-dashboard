# synchronous-dashboard
![Screenshot of dashboard](Screenshot%202020-06-02%20at%208.58.40%20PM.png)
A dashboard that can be used in meetings to allow participants to indicate emotions, chat, and raise hands without using video. It also features an interactive whiteboard that can also be used to annotate images uploaded by the instructor. It's google apps script based and will only work in a full G-suite application. [See my blog post about it here](https://arundquist.wordpress.com/2020/04/08/synchronous-meeting-dashboard/)

[A loom video showing the features](https://www.loom.com/share/08587f10819a4f82b0a945542c3b9df0)

## features
* Emotions
    * Buttons for participants like "Excited" or "Agree" or "Confused" will light up that participant's name in the displayed roster with a particular color.
* Chat
    * A simple chat interface that is persistent. If someone has to reload or joins late they will see all the chat history
    * Also a 1-to-1 chat feature where participants can chat with each other
    * A "think-pair-share" feature where you can randomly put participants into pairs for chatting
* Raise hands
    * There are two queues. One is for questions about the current topic and one is for new topics. 
    * Participants can raise, lower, and transfer their "hands." Transfer moves their hand to the other queue
    * Instructors can "call on" people
* Whiteboard
    * Both the instructor and the participants can draw in the whiteboard
    * Works well with touch devices and various stylus options (tested with Wacam Bamboo tablet, Surface Pro, and a Note 10 Android phone with Samsung stylus)
* Upload images
    * Only instructors can upload images that get uploaded to a google drive folder that the instructor defines
    * The google drive download link for the image is then sent to everyone via Pusher and they download it
    * The instructor can switch among any images that have been uploaded (and the original whiteboard as well). The switching does not download new copies for the participants as they've already downloaded it and they all get saved locally.
* Low bandwidth
    * While this needs to be paired with an audio webconference, this tool uses very little bandwidth. All interactions are low payload AJAX calls that lead to low bandwidth WebSocket events.
    
Note that the roadmap with future features is on the wiki.
    
## technology
* Google Sheet as the data storage device (this is what makes it so easy to share with others)
* Google Apps Script to provide both the server javascript code and the client html and javascript
* [Pusher.com](http://pusher.com) for the WebSockets.
    * Note that you'll need a pusher account to make this work
    * The free level at pusher enables meetings with up to 100 participants

## Lifecyle of an "event"
1. Participant does something
    * Presses an emotion button, chats, or raises a hand
2. Client javascript sends AJAX request to the Google Apps Script javascript server script with a payload to describe the event.
3. Server saves appropriate data to the spreadsheet and launches a Pusher event.
4. Pusher broadcasts the event to all participants.
5. Client javascript responds
    * changes the color of the participant, adds the chat text, or indicates that a hand has been raised.
    
## Installation
* Make a copy of the [Google Sheets template](https://docs.google.com/spreadsheets/d/1LkzJapJFeiI61kn92gD0otYyFZsRfUg0wAGea4jzBB8/edit?usp=sharing)
* Open the script editor in google sheets (Tools -> Script editor)
* Update the user email in "code.gs"
* Update the google drive folder in "code.gs"
* Update the "pusher" variable in "main.html" with the appropriate information from your pusher account
* Update the "pvals" variable in "pusher.gs" with the appropriate information from your pusher account
* Go to "Publish -> Deploy as web app" and make a new version, deciding who has access.
    * the first time this will ask you to review the permissions
* Copy the url under the "deploy as web app" window and share with participants
* Add participants email and names to the "roster" tab in the spreadsheet

## Make your own
Create a google sheet with the following tabs:
* roster: Column A is emails, Column B is names. This one has a header row
* emotions: Column A is emotion, Column B is color. No header row
* chats: Column A will hold all the chats
* present: Column A will hold the ids of roster participants that have gone to the url. No header row
* lowered: Column A is roster id, B is raised timestamp, C is lowered timestamp, D is 0 for student lowered, 1 for instructor lowered. No header row
* raised hands: Column A is queuename, B is roster id, C is timestamp. No header row
* transfers: Column A is roster id, B is raised timestamp, C is transferred timestamp, D is new queuename. No header row

Then create a bound script (Tools -> script editor) and create these files:
* code.gs: paste in the code in this repository called code.js (I call it .js here for good formatting)
* pusher.gs: paste in the code called pusher.gs
* main.html: paste in the code called main.html

Note that the spreadsheet will then have a custom menu item that will clear out all the data in chats, present, lowered, raised hands, and transfers.

Update your pusher info and your user email in the places with all caps.

Then Publish->Deploy as web app. Update the roster tab with participants for your meeting.
