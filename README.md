ManyWho HTML5 Players
=====================

First thing. What's an HTML5 Player?

When you build an app on the ManyWho platform (http://manywho.com), it doesn't actually have any user interface. Yes, despite you seeing a user interface, this is not being generated by our platform directly.  The platform only describes the UI and it's up to the "player" to turn that description into something a user can actually see!  It's a bit like a content management system.  You have your content (or in our case, the app) and then you have templates that make that content look awesome.  ManyWho works in a similar way - except in our case - the templates sit on the device, not on the server.  We call these templates "players".

All of our players are share source.  You can read our shared source agreement here:

http://manywho.com/sharedsource

All that basically says is that if you want to use this code, make sure you use it with our platform.

##Development Setup
1. Install [nodejs](http://nodejs.org/)
2. Install gulp cli `npm install gulp -g`
3. cd into the runtime folder and run `npm install`

If you are running on Windows you will also need to install the following (to build socket.io):

- `npm install -g node-gyp`
- python 2.7.3 http://www.python.org/download/releases/2.7.3#download
- VS 2012 Express http://go.microsoft.com/?linkid=9816758

Then run `npm install --msvs_version=2012`

You can start the dev "server" by running `gulp refresh`, this will auto refresh the browser when any changes are made to the static resource files (js, css, html, etc).

You can then view the flow by opening http://localhost:3000?tenant-id=<tenant-id>&flow-id=<flow-id>&flow-version-id=<flow-version-id> to initialize a flow or
http://localhost:3000?tenant-id=<tenant-id>&join=<state-id> to join an already running flow

If you don't have a state id you can get it entering `manywho.state.getState().id` in the browser console once the flow is running.

##Docs
Some more information about the HTML5 player can be found here: https://developers.manywho.com/display/MA/HTML5
