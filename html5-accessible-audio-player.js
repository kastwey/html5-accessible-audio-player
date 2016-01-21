//  html5-accessible-audio-player
// Juan José Montiel Pérez: @kastwey.
// http://www.programad.me
// This little script finds all the audio elements of a page.
// For each  element, it adds accessible controls above it, in order to   manipulate the player.
// to add the title in links, add an attribute called "data-title" with the audio title.
// Additionally, you can add the data-showDownloadLink attribute to the element. If the attribute is true,
//  a download link will be rendered above accessible controls.

// Audio ReadyState constants
const AUDIO_HAVE_NOTHING = 0, AUDIO_HAVE_METADATA = 1, AUDIO_HAVE_CURRENT_DATA = 2,
	AUDIO_HAVE_FUTURE_DATA = 3, AUDIO_HAVE_ENOUGH_DATA = 4;



// Says a text with active screen reader using aria live capabilities.
function accessibleAlert(text, wrapper) {
	if (wrapper.length == 0 || !wrapper.is(":visible")) return;
	setTimeout(function () {
		var divAlert;
		if (wrapper.find(".audioStateParagraph").length == 0) {
			var msgParagraph = $('<p class="sr-only audioStateParagraph">' + _('último mensaje de estado:') + '</p>');
			divAlert = $('<div class="divAlert" role="alert" aria-live="assertive"></div>');
			msgParagraph.append(divAlert);
			wrapper.append(msgParagraph);
		}
		else {
			divAlert = wrapper.find(".divAlert");
		}
		divAlert.html(text);
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
	audioElement.attr("preload", "auto").attr("aria-hidden", "true");
	var wrap = $("<div class=\"playerWrapper\"></div");
	audioElement.wrap(wrap);
	wrap = audioElement.parent();
	if (audioNativeElement.readyState >= AUDIO_HAVE_CURRENT_DATA) {
		addAccessibleControls(wrap);
	}
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
}


function addAccessibleControls(audioWrapper) {
	var audioElement = audioWrapper.find("audio:first");
	var audioNativeElement = audioElement[0];
	var title = audioElement.attr("data-title");
	var controlsLayer = audioWrapper.find(".playerControls");
	if (controlsLayer.length > 0) {
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
		var url;
		if (audioElement.attr("src") !== undefined) {
			url = audioElement.attr("src");
		}
		else {
			var source = audioElement.find("source[src]:first");
			if (source.length > 0) {
				url = source.attr("src");
			}
		}
		if (url !== undefined) {
			var lnkDownload = $('<a class="lnkDownload" href="' + url + '">' + _('Descargar {0}', addTitle(title, _('el audio'))) + '</a>');
			var pLnkDescargar = $("<p></p>");
			pLnkDescargar.append(lnkDownload);
			pLnkDescargar.insertBefore(controlsLayer);
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
		$(this).parents(".playerControls").removeClass("sr-only");
	});
	$("html").on("blur", "a.btnPlayerControl", function () {
		$(this).parents(".playerControls").addClass("sr-only");
	});
	preparePlayers();
});