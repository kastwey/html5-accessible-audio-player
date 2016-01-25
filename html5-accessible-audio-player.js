//  html5-accessible-audio-player
// Juan José Montiel Pérez: @kastwey.
// http://www.programad.me
// This little script finds all the audio elements of a page.
// For each  element, it adds accessible controls above it, in order to   manipulate the player.
// to add the title in links, add an attribute called "data-title" with the audio title.
// Additionally, you can add the data-showDownloadLink attribute to the element. If the attribute is true,
//  a download link will be rendered above accessible controls.

(function () {
	// flag enum to define controls visibility
	var html5ConfigVisibility = {
		// All controls visibles for everybody
		allVisible: 0,
		// Native html5 audio element visually hidden using css class defined in styles.css
		audioHideVisually: 1,
		// native html5 audio element hidden for screen readers (using aria-hidden)
		audioHideScreenReaders: 2,
		// Accessible controls visually hidden using css class defined in styles.css
		accessibleControlsHideVisually: 4
	};
	var configHtml5AcAudio = html5ConfigVisibility.audioHideScreenReaders | html5ConfigVisibility.audioHideVisually;
	var html5AcAudio = new Object();
	html5AcAudio.configure = function (config) {
		configHtml5AcAudio = config;
	}
	html5AcAudio.getConfig = function () {
		return configHtml5AcAudio;
	}
	html5AcAudio.configVisibility = html5ConfigVisibility;
	window.html5AcAudio = html5AcAudio;
})();



// Audio ReadyState constants
const AUDIO_HAVE_NOTHING = 0, AUDIO_HAVE_METADATA = 1, AUDIO_HAVE_CURRENT_DATA = 2,
	AUDIO_HAVE_FUTURE_DATA = 3, AUDIO_HAVE_ENOUGH_DATA = 4;



// Says a text with active screen reader using aria live capabilities.
function accessibleAlert(text) {
	setTimeout(function () {
		var divAlert;
		if ($("#accessibleMessage").length > 0) {
			$("#accessibleMessage").remove();
		}
		var messageParagraph= $('<p class="sr-only" id="accessibleMessage">' + _('Mensaje:') + ' </p>');
		divAlert = $('<div id="alertDiv" role="alert" aria-live="assertive"></div>');
		messageParagraph.append(divAlert);
		$("body").append(messageParagraph);
		divAlert.html("dummy");
		divAlert.html(text);
		setTimeout(function () { $("#accessibleMessage").remove(); }, 100);
	}, 1);
}



// Return a string composed by prefix and title.
// if includeHiddenSpan is true, the text is surrounded by a hidden span that is only visible to screen readers.
// By default, includeHiddenSpan is true.
function addTitle(title, prefix, includeHiddenSpan) {
	if (prefix == null) prefix = undefined;
	if (includeHiddenSpan === undefined) includeHiddenSpan = true;
	if (title !== undefined) {
		return (includeHiddenSpan ? '<span class="sr-only">' : '') +
			(prefix !== undefined ? ' ' + prefix + ' ' : '') +
			' "' + title + '"' + (includeHiddenSpan ? '</span>' : '');
	}
	else {
		return '';
	}
}

function getStrTime(duration) {
	if (duration == "Infinity") return _("Retransmitiendo");
	if (duration === undefined) return _("desconocida");
	if (duration == 0) return _('{0} segundos', '0');
	var result = new Array();
	if (duration > 3600) {
		var h= parseInt(duration / 3600);
		if (h > 1) result.push(_("{0} horas", h.toString()));
		else result.push(_("{0} hora", hras.ToString()));
		duration %= 3600;
	}
	if (duration > 60) {
		var m = parseInt(duration / 60);
		if (m > 1) result.push(_("{0} minutos", m.toString()));
		else result.push(_("{0} minuto", m.toString()));
		duration %= 60;
	}
	if (duration > 0) {
		var s = parseInt(duration);
		if (s > 1) result.push(_("{0} segundos", s.toString()));
		else result.push(_("{0} segundo", s.toString()));
	}
	return (result.length > 1 ? _("{0} y {1}", result.slice(0, result.length - 1).join(', '), result[result.length - 1])
		: result[0]);
}

function preparePlayers() {
	if (!window.HTMLAudioElement) {
		alert(_("Imposible generar reproductores HTML5. Tu navegador no es compatible. Por favor, actualízalo."));
		return;
	}
	$("audio").each(function (i, val) { preparePlayer($(val)); });
}

function preparePlayer(audioElement) {
	// If this player already has been processed to include accessibility layer and events, do not do anithing.
	if (audioElement.parent().hasClass("playerWrapper")) return;
	var audioNativeElement = audioElement[0];
	audioElement.attr("preload", "auto");
	var cf = html5AcAudio.getConfig();
	if (cf & html5AcAudio.configVisibility.audioHideScreenReaders == html5AcAudio.configVisibility.audioHideScreenReaders) audioElement.attr("aria-hidden", "true");
	if (cf & html5AcAudio.configVisibility.audioHideVisually == html5AcAudio.configVisibility.audioHideVisually) audioElement.hide();
	audioElement.data["src"] = audioElement.attr("src");
	var wrap = $("<div class=\"playerWrapper\"></div");
	audioElement.wrap(wrap);
	wrap = audioElement.parent();
	addAccessibleControls(wrap);
	
	audioNativeElement.oncanplay = function () {
		addAccessibleControls(wrap);
	}
	audioNativeElement.onplay = function () {
		var jqueryAudio = $(this);
		var titleAudio = jqueryAudio.attr("data-title");
		$("audio").not(jqueryAudio).each(function (i, val) { if (!val.paused) val.pause(); });
		accessibleAlert(_("Reproduciendo..."), wrap);
		wrap.find(".btnPlay").html(_("Pausar {0}", addTitle(titleAudio, _("el audio"))));
	};
	audioNativeElement.ondurationchange = function () {
		wrap.find(".ddDuration").html(getStrTime(this.duration));
	};
	audioNativeElement.onended = function () {
		accessibleAlert(_("Audio finalizado."), wrap);
		var jqueryAudio = $(this);
		var titleAudio = jqueryAudio.attr("data-title");
		wrap.find(".btnPlay").html(_("Reproducir {0}", addTitle(titleAudio, _("el audio"))));
	};
	audioNativeElement.onseeked = function () {
		accessibleAlert(_("Movido a la posición {0}", getStrTime(this.currentTime)), wrap);
	};
	audioNativeElement.onvolumechange = function () {
		accessibleAlert(_("Volumen ajustado al {0}%.", (~~(this.volume * 100)).toString()), wrap);
	};
	audioNativeElement.onerror = function () {
		var jqueryAudio = $(this);
		var titleAudio = jqueryAudio.attr("data-title");
		alert(_("Error al cargar el audio {0}. Código de error: {1}.", audioTitle, audioElement.error.code));
	};
	audioNativeElement.ontimeupdate = function () {
		wrap.find(".ddPosition").html(getStrTime(this.currentTime));
	};
	audioNativeElement.onpause = function () {
		var jqueryAudio = $(this);
		var titleAudio = jqueryAudio.attr("data-title");
		wrap.find(".btnPlay").html(_("Reproducir {0}", addTitle(titleAudio, _("el audio"))));
		accessibleAlert(_("Pausado..."), wrap);

	};
	audioElement.focus(function () {
		if ($(this).attr("aria-hidden") == "true") {
			$(this).removeAttr("aria-hidden");
		}
	});
	audioElement.blur(function () {
		var cf = html5AcAudio.getConfig();
		if (cf & html5AcAudio.configVisibility.audioHideScreenReaders == html5AcAudio.configVisibility.audioHideScreenReaders) $(this).attr("aria-hidden", "true");
	});

}

function getAudioType(src, type) {
	if (type === undefined) {
		if (src.indexOf(".") == -1) return undefined;
		return src.split('.').pop();
	}
	else {
		if (type.indexOf("/") != -1) {
			var mimetype = type.split("/").pop();
			if (mimetype.toLowerCase() == "mpeg") return "mp3";
			return mimetype;
		}
		else {
			return type;
		}
	}
}


function getAudioSources(audioElement) {
	var url;
	var sources = [];
	if (audioElement.attr("src") !== undefined) {
		sources.push({ url :  audioElement.attr("src"), type : getAudioType(src) });
	}
	audioElement.find("source[src]").each(function (i, val) { val = $(val); sources.push({ src: val.attr("src"), type: getAudioType(val.attr("src"), val.attr("type")) }) });
	return sources;
}
		

function addAccessibleControls(audioWrapper) {
	var audioElement = audioWrapper.find("audio:first");
	var audioNativeElement = audioElement[0];
	var title = audioElement.attr("data-title");
	var controlsLayer = audioWrapper.find(".playerControls");
	if (controlsLayer.length > 0) {
		var priorSrc = audioElement.data["src"];
		// if src has not changed since last accessible controls creation, do not do anything.
		if (audioElement.attr("src") == priorSrc) return;
		controlsLayer.remove();
	}
	var btnPlay = $('<a href="#" class="btnPlayerControl btnPlay" >' + _('Reproducir {0}', addTitle(title, _('el audio'))) + '</a>');
	var btnMute = $('<a href="#" class="btnPlayerControl btnMute">' + _('Silenciar {0}', addTitle(title, _('el audio'))) + '</a>');
	var btnVolumeDown = $('<a href="#" class="btnPlayerControl btnVolumeDown">' + _('Bajar volumen {0}', addTitle(title, _('al audio'))) + '</a>');
	var btnVolumeUp = $('<a href="#" class="btnPlayerControl btnVolumeUp">' + _('Subir volumen {0}', addTitle(title, _('al audio'))) + '</a>');
	var btnFw30Secs = $('<a href="#" class="btnPlayerControl btnFw30Secs">' + _('Avanzar treinta segundos {0}', addTitle(title, _('en el audio'))) + '</a>');
	var btnBw30Secs = $('<a href="#" class="btnPlayerControl btnBw30Secs" >' + _('Retroceder treinta segundos {0}', addTitle(title, _('en el audio'))) + '</a>');
	var dlInfo = $('<dl></dl>');
	var dtPosition = $('<dt>' + _('Posición:') + '</dt>');
	var ddPosition = $('<dd class="ddPosition">' + _('0 segundos') + '</dd>');
	var dtDuration = $('<dt>' + _('Duración:') + '</dt>');
	var ddDuration = $('<dd class=\"ddDuration\">' + getStrTime(audioNativeElement.duration) + '</dd>');
	var ul = $("<ul></ul>"), liPlay = $('<li class="liControl"></li>'), liMute = $('<li class="liControl"></li>'), liVolumeDown = $('<li class="liControl"></li>'), liVolumeUp = $('<li class="liControl"></li>'), liFw30Secs = $('<li class="liControl"></li>'), liBw30Secs = $('<li class="liControl"></li>');
	controlsLayer = $("<div class=\"playerControls sr-only\"></div>");
	controlsLayer.insertBefore(audioElement);
	if (audioElement.attr("data-showDownloadLink") == "true") {
		var sources = getAudioSources(audioElement);
		if (sources.length > 0) {
			if (sources.length > 1)
			{
				var listSources = $("<ul></ul>");
				for(var s in sources)
				{
					var source = sources[s];
					if (source.type !== undefined) {
						listSources.append($("<li><a class=\"downloadLink\" href=\"" + source.src + "\">" +
							_("Descargar {0} en formato {1}", addTitle(title, _("el audio")), source.type) + "</a></li>"));
					}
					else {
						listSources.append($("<li><a class=\"downloadLink\" href=\"" + source.src + "\">" +
							_("Descargar {0}, formato no especificado", addTitle(title, _("el audio"))) + "</a></li>"));
					}
				}
				listSources.insertBefore(controlsLayer);
			}
			else{
				var lnkDownload = $('	<a class="lnkDownload" href="' + sources[0].src + '">' + _('Descargar {0}', addTitle(title, _('el audio'))) + '</a>');
				var pLnkDescargar = $("<p></p>");
				pLnkDescargar.append(lnkDownload);
				pLnkDescargar.insertBefore(controlsLayer);
			}
		}
	}
	controlsLayer.append(ul);
	liPlay.append(btnPlay);
	ul.append(liPlay);
	// In iOS, the audio volume can not be controlled by javascript, so remove buttons
	if (!navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
		liVolumeDown.append(btnVolumeDown);
		ul.append(liVolumeDown);
		liVolumeUp.append(btnVolumeUp);
		ul.append(liVolumeUp);
		liMute.append(btnMute);
		ul.append(liMute);
	}
	liFw30Secs.append(btnFw30Secs);
	ul.append(liFw30Secs);
	liBw30Secs.append(btnBw30Secs);
	ul.append(liBw30Secs);
	dlInfo.append(dtPosition);
	dlInfo.append(ddPosition);
	dlInfo.append(dtDuration);
	dlInfo.append(ddDuration);
	dlInfo.insertAfter(ul);
	// If it isn't iPhone, we add role "button" to all player controls link.
	if (!navigator.userAgent.match(/(iPod|iPhone|iPad)/)) { ul.find(".btnPlayerControl").attr("role", "button"); }
}


$(function () {
	$("html").on("click", ".btnPlay", function (e) {
		e.preventDefault();
		var wraper = $(this).parents(".playerWrapper");
		var audioElement = wraper.find("audio");
		audioElement = audioElement[0];
		if (audioElement.paused) {
			audioElement.play();
		}
		else {
			audioElement.pause();
		}
	});
	
	$("html").on("click", ".btnMute", function (e) {
		e.preventDefault();
		var wraper = $(this).parents(".playerWrapper");
		var audioElement = wraper.find("audio");
		var title = audioElement.attr("data-title");
		audioElement = audioElement[0];
		if (audioElement.muted) {
			$(this).html(_('Silenciar {0}', addTitle(title, _('el audio'))));
		}
		else {
			$(this).html(_('Activar sonido {0}', addTitle(title, _('al audio'))));
		}
		audioElement.muted = !audioElement.muted;
	});
	$("html").on("click", ".btnVolumeUp", function (e) {
		e.preventDefault();
		var wrapper = $(this).parents(".playerWrapper");
		var audioElement = wrapper.find("audio")[0];
		if (audioElement.volume == 100.0) return;
		if (audioElement.volume > 0.9) audioElement.volume = 1;
		else audioElement.volume += 0.1;
	});

	$("html").on("click", ".btnVolumeDown", function (e) {
		e.preventDefault();
		var wrapper = $(this).parents(".playerWrapper:first");
		var audioElement = wrapper.find("audio")[0];
		if (audioElement.volume == 0.0) return;
		if (audioElement.volume < 0.1) audioElement.volume = 0;
		else audioElement.volume -= 0.1;
	});
	
	$("html").on("click", ".btnFw30Secs", function (e) {
		e.preventDefault();
		var wrapper = $(this).parents(".playerWrapper:first");
		var audioElement = wrapper.find("audio")[0];
		if (audioElement.currentTime + 30 > audioElement.duration) audioElement.currentTime = audioElement.duration;
		else audioElement.currentTime += 30;
	});
	$("html").on("click", ".btnBw30Secs", function (e) {
		e.preventDefault();
		var wrapper = $(this).parents(".playerWrapper:first");
		var audioElement = wrapper.find("audio")[0];
		if (audioElement.currentTime - 30 < 0) audioElement.currentTime = 0;
		else audioElement.currentTime -= 30;
	});
	$("html").on("focus", "a.btnPlayerControl", function () {
		var playerControls = $(this).parents(".playerControls");
		if (playerControls.hasClass("sr-only")) playerControls.removeClass("sr-only");
	});
	$("html").on("blur", "a.btnPlayerControl", function () {
		var cf = html5AcAudio.getConfig();
		if (cf & html5AcAudio.configVisibility.accessibleControlsHideVisually == html5AcAudio.configVisibility.accessibleControlsHideVisually) $(this).parents(".playerControls").addClass("sr-only");
	});
	preparePlayers();
});