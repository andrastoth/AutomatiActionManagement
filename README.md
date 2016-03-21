# Automatic Actions Management
This chrome extension will able to run predefined user events.

Version
----

1.0.0

Example usage
----

Cookie accepter:

	- Visit webpage where you want to use AAM.
	- Click right mouse button on cookies accepter link or buton.
	- Select -Add to AAM- menu from context menu list.
<p>
   <img src = "aam1.jpg" width="100%"/>
</p>
	- Action created in the background with default settings.
	- To view settings click on AAM icon on top right corner of the browser,
	  and click AAM setting button.
	- Settings tab opens.
<p>
   <img src = "aam2.jpg" width="100%"/>
</p>

Settings tab table columns:

   	- Target URL: that page url where you want to activate AAM
   	- Selector Or Script: selected item full DOM path Or script Filename*
   	- Document state: page state when you want to activate action (Dom content loaded or window loaded)
   	- Event type: click, remove or script (inject)
   	- Repeat: repeat count
   	- Timeout (ms): repeat timeouts
   	- On-Off: enable, disable
   	- Remove: delete row
   	
*created automatically if selected event is injected and you clicked into 'selector or script' cell.
<p>
   <img src = "aam3.jpg" width="100%"/>
</p>
      - Script inject mode
<p>
   <img src = "aam4.jpg" width="100%"/>
</p>
      - If you are done click save all button
   
License
----

MIT

Author: Tóth András
---
http://atandrastoth.co.uk/

2016-03-16
