#html5-accessible-audio-player
Juan José Montiel Pérez: [@kastwey](http://www.twitter.com/kastwey).
[http://www.programad.me](http://www.programad.me)

## Introduction
This little script finds all the audio elements of a page. For each  element, adds accessible controls above it, in order to   manipulate the player.
The script requires Jquery 1.7 or above. Jquery 2.1.4 is included.

The script is currently in Spanish and in an bad english , so translations and corrections are greatly apreciated ;)

For translations, I'm using the tools from: [http://www.localeplanet.com](http://www.localeplanet.com)

If you want to collaborate in translation or improving the player, feel free to do it by using the github repository: [https://github.com/kastwey/html5-accessible-audio-player](https://github.com/kastwey/html5-accessible-audio-player)

Enjoy it!

##Using the script

To embed the script in your page, simply add the js files listed below in your body tag (it's better include them at the end of body tag), in the following order:
* jquery (verify jquery inclusion in your page to avoid duplicated jquery libraries).
* translate.js (Translation script  file).
* icu_<language>.js (translation script for language you want to translate the script).
* <language>.js (script containing translated resources to specified language).
* html5-accessible-audio-player.js (the main script).

Example:
	```js
	<script type="text/javascript" src="jquery-2.1.4.min.js"></script>
	<script type="text/javascript" src="icu_en.js"></script>
	<script type="text/javascript" src="translate.js"></script>
	<script type="text/javascript" src="en.js"></script>
	<script type="text/javascript" src="html5-accessible-audio-player.js"></script>
	```

## Configuring the player

There are a function which you can manage the visibility of audio element and accessible controls.
To configure this, after embedding all scripts, make a call to the function html5AcAudio.configure, passing it one o more elements from visibility enumeration defined in html5AcAudio.configureVisibility:
* All controls visibles for everybody: allVisible
* Native html5 audio element visually hidden using css class defined in styles.css: audioHideVisually
* native html5 audio element hidden for screen readers (using aria-hidden): audioHideScreenReaders,
*Accessible controls visually hidden using css class defined in styles.css: accessibleControlsHideVisually
	```js
	<script type="text/javascript">
		html5AcAudio.configure(html5AcAudio.configVisibility.audioHideScreenReaders | html5AcAudio.configVisibility.audioHideVisually);
	</script>
	```

	Example to hide the native html5 audio element both visually and to screen readers:

	
