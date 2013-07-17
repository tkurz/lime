PROJECT
=======
LimePlayer is a player for semantically interlinked videos. It is developed within the
ConnectMe Project (http://connectme.sti2.org/).

CONTACT
=======
Szaby Grünwald
Salzburg Research Forschungsgesellschaft
Salzburg, Austria
szaby.gruenwald@salzburgresearch.at

Online demo
===========
[tkurz.github.com/lime](http://tkurz.github.com/lime/)

Integrate
=========
For including the coe into your html file you'll need the following files to be included:
## CSS
* css/video-js.min.css
* One of
  * css/screen.css
  * css/full-screen.css
  * css/full-screen-tv.css
## JS
* jQuery 1.7+
* One of
  * `lib/underscoreJS/underscore.min.js`, `lib/backboneJS/backbone.js`, `lib/rdfquery/latest/jquery.rdfquery.debug.js`, `lib/vie/vie.js`
  are the dependencies
  * `lib/lime-deps\[.min\].js` The above dependencies packed for you in one file
* One of
  * `lib/lime\[.min\].js` contains the player with all plugins in the repository
  * `lib/lime-core\[.min\].js` contains the player only, without the widget plugins
For data integration see the Wiki page [Integration Manual](https://github.com/tkurz/lime/wiki/Integration-Manual)

LICENSE
=======
Apache License, Version 2.0 (http://www.apache.org/licenses/LICENSE-2.0.html)

CODE
====
For a detailed documentation on the architecture see [the Github wiki](http://github.com/tkurz/lime/wiki) or the
documented [source code](http://tkurz.github.io/lime/docs)

Build
=====
1. Install [node.js](http://nodejs.org) v0.6 or later
2. Install grunt by running `npm install -g grunt`
3. Install node dependencies by running `npm install` from the console

For building the compiled and the minified javascript files, run `grunt` or during develpment `grunt watch`

For generating an easy to read documented source code in html with docco-husky, run `grunt doc`.
