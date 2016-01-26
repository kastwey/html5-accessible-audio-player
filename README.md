#html5-accessible-audio-player
Juan José Montiel Pérez: [@kastwey](http://www.twitter.com/kastwey).
[http://www.programad.me](http://www.programad.me)

## Introduction
This little script finds all the audio elements of a page. For each  element, adds accessible controls above it, in order to   manipulate the player.
The script requires Jquery 1.7 or above. Jquery 2.1.4 is included.

The script is currently in Spanish and in a bad english , so translations and corrections are greatly apreciated ;)

If you want to collaborate in translation or improving the player, feel free to do it by using the github repository: [https://github.com/kastwey/html5-accessible-audio-player](https://github.com/kastwey/html5-accessible-audio-player). See section [How to translate the script to your language](#translate) for more information about translations.


Enjoy it!

##Using the script

To embed the script in your page, simply add the js files listed below in your body tag (it's better include them at the end of body tag), in the following order:
* jquery (verify jquery inclusion in your page to avoid duplicated jquery libraries).
* translate.js (Translation script  file).
* icu_<language>.js (translation script for language you want to translate the script).
* <language>.js (script containing translated resources to specified language).
* html5-accessible-audio-player.js (the main script).

###Example, in english:
	
	<script type="text/javascript" src="jquery-2.1.4.min.js"></script>
	<script type="text/javascript" src="icu_en.js"></script>
	<script type="text/javascript" src="translate.js"></script>
	<script type="text/javascript" src="en.js"></script>
	<script type="text/javascript" src="html5-accessible-audio-player.js"></script>
	
###Example, in spanish:

Since the script is written originally in Spanish, if we want to keep this language, we will skip the inclusion of translation script en.js, and we will change the file icu_en.js by icu_es.js:

	<script type="text/javascript" src="jquery-2.1.4.min.js"></script>
	<script type="text/javascript" src="icu_es.js"></script>
	<script type="text/javascript" src="translate.js"></script>
	<script type="text/javascript" src="html5-accessible-audio-player.js"></script>

## Configuring the player

There are a function which you can manage the visibility of audio element and accessible controls.
To configure this, after embedding all scripts, make a call to the function html5AcAudio.configure, passing it one o more elements from visibility enumeration defined in html5AcAudio.configureVisibility:
* All controls visibles for everybody: allVisible
* Native html5 audio element visually hidden using css class defined in styles.css: audioHideVisually
* native html5 audio element hidden for screen readers (using aria-hidden): audioHideScreenReaders,
*Accessible controls visually hidden using css class defined in styles.css: accessibleControlsHideVisually

Example to hide the native html5 audio element both visually and to screen readers:


	<script type="text/javascript">
		html5AcAudio.configure(html5AcAudio.configVisibility.audioHideScreenReaders | html5AcAudio.configVisibility.audioHideVisually);
	</script>
	

	
	
##How to translate the script to your language?{#translations}

Do you really thing to do it? Great!

To translate the scripts, I am using the toolkit provided by [localplanet.com](http://www.localplanet.com)

In the local project folder, you'll see a file called es.po. This file contains all messages in Spanish that would have to translate the language you want.

To create a new pot file, I recommend using the free tool [poedit](https://poedit.net/).

Create a new pot file, and use the es.po to load the messages. After to translate all messages, use the po2js.py tool that can be downloaded from: https://github.com/fileformat/lptools/blob/master/po2js.py to convert the .pot file to js.

Include, within the local folder, your js and pot file, using the naming convention xx-YY, where xx is the two-character code of the language, and YY is the two-character code of the country.
If the country is not important, you can omit it. That is:  if there are not specific files for diferent countries in the same language ( en-US, en-GB), use only the two characters language code in both files.

You can view the table of ISO codes on the following link: http://www.lingoes.net/en/translator/langcode.htm

And finally, make a pull request from github, and  I will merge your changes!

Thank you!




