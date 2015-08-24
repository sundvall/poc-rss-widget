# poc-rss-widget  
This widget is used with one js-file, one css-file and one line of html for each rss-flow to read. The widget is currently build to adapt one specific format (see below).

## usage
Use the setup from the dist-folder to test.  

 The rss-slider is used on a website with configuration done in the html-tag:  
```html
<div class='rss_widget rss_ab' items='5' rel='http://www.aftonbladet.se/rss.xml' format='5_1'></div>

```
configuration:  
<b>items</b> = number of rss-items to view each time for the separate flow
<b>rel</b> = path to rss flow  
<b>format</b> = aspectratio of the rss-item container, all content has to be styled to fit this area, currently formats are '1_1', '4_3', '16_9', '3_1','5_1  
see the 'height_scale.js' module for all formats  


## development

### about  
The application is build with gulp and browserify. See the 'package.json' for all modules used during development. The architecture is based on 'flux' -
[http://facebook.github.io/flux/docs/overview.html](http://facebook.github.io/flux/docs/overview.html), and modified to ES5 syntax. The view system is based on one control ('slider_viewcontrol.js'_) which uses utilitiy modules from the 'utils' folder. The main purpose of the modules are to keep them small and dedicated to one task each.  
Entry point for the js-bundling is 'js/lib/main.js' where dependencies are seen in the 'require' calls.  

### build 
npm install

gulp

### build for production
gulp build

### <i>todo
<i>apply nice style from class 'rss_ab'
