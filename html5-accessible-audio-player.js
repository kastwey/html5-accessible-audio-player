//  html5-accessible-audio-player
// Juan José Montiel Pérez: @kastwey.
// http://www.programad.me
// This little script finds all the audio elements of a page.
// For each  element, adds accessible controls above it, in order to   manipulate the player.
// In order to add the title in links, add an attribute called "data-title" with the audio title.
// Additionally, you can add the data-showDownloadLink attribute to the element. If the attribute is true,
//  a download link will be rendered above accessible controls.

function accessibleAlert(text, wrapper) {
	if (wrapper.length == 0 || !wrapper.is(":visible")) return;
	setTimeout(function () {
		var divAlert;
		if (wrapper.find(".parrafoEstadoAudio").length == 0) {
			var parrafoMensaje = jQuery('<p class="sr-only parrafoEstadoAudio">último mensaje de estado: </p>');
			divAlert = jQuery('<div class="divAlertaAudio" role="alert" aria-live="assertive"></div>');
			parrafoMensaje.append(divAlert);
			wrapper.append(parrafoMensaje);
		}
		else {
			divAlert = wrapper.find(".divAlertaAudio");
		}
		divAlert.html(text);
	}, 1);
}

function agregaTitulo(titulo, prefijo, incluirSpanOculto) {
	if (prefijo == null) prefijo = undefined;
	if (incluirSpanOculto === undefined) incluirSpanOculto = true;
	if (titulo !== undefined) {
		return (incluirSpanOculto ? '<span class="sr-only">' : '') +
			(prefijo !== undefined ? ' ' + prefijo + ' ' : '') +
			' "' + titulo + '"' + (incluirSpanOculto ? '</span>' : '');
	}
	else {
		return '';
	}
}

function getTiempo(duracion) {
	if (duracion == 0) return "0 segundos";
	var resultado = new Array();
	if (duracion > 3600) {
		var horas = parseInt(duracion / 3600);
		resultado.push(horas.toString() + " hora" + (horas > 1 ? "s" : ""));
		duracion %= 3600;
	}
	if (duracion > 60) {
		var minutos = parseInt(duracion / 60);
		resultado.push(minutos.toString() + " minuto" + (minutos > 1 ? "s" : ""));
		duracion %= 60;
	}
	if (duracion > 0) {
		resultado.push(parseInt(duracion).toString() + " segundo" + (duracion > 1 ? "s" : ""));
	}
	return (resultado.length > 1 ? resultado.slice(0, resultado.length - 1).join(', ') + ' y ' + resultado[resultado.length - 1] : resultado[0]);
}

function cargaReproductores() {
	if (!window.HTMLAudioElement) {
		alert("Imposible generar reproductores HTML5. Tu navegador no es compatible. Por favor, actualízalo.");
		return;
	}
	jQuery("audio").each(function (i, val) { cargaReproductor(jQuery(val)); });
}

function cargaReproductor(audioElement) {
	// Este reproductor ya está cargado.
	if (audioElement.parent().hasClass("wrapRepro")) return;
	audioElement.attr("preload", "auto").attr("aria-hidden", "true");
	var wrap = $("<div class=\"wrapRepro\"></div");
	audioElement.wrap(wrap);
	wrap = audioElement.parent();

	var titulo = audioElement.attr("data-title");
	audioElement = audioElement[0];
	audioElement.onplay = function () {
		accessibleAlert("Reproduciendo...", wrap);
		wrap.find(".btnPlay").html("Pausar" + agregaTitulo(titulo, "el audio"));
	};
	audioElement.onplaying = function () {
		jQuery("audio").not(jQuery(audioElement)).each(function (i, val) { if (!val.paused) val.pause(); });

		wrap.find(".btnPlay").html("Pausar" + agregaTitulo(titulo, "el audio"));
	};
	audioElement.oncanplay = function () {
		wrap.find(".btnMute").html('Silenciar' + agregaTitulo(titulo, 'el audio'));
		wrap.find(".ddDuracion").html(getTiempo(this.duration));
	};
	audioElement.ondurationchange = function () {
		wrap.find(".ddDuracion").html(getTiempo(this.duration));
	};
	audioElement.onended = function () {
		accessibleAlert("Audio finalizado.", wrap);
		wrap.find(".btnPlay").html("Reproducir" + agregaTitulo(titulo, "el audio"));
	};
	audioElement.onseeked = function () {
		accessibleAlert("Movido a la posiciÃ³n " + getTiempo(this.currentTime), wrap);
	};
	audioElement.onvolumechange = function () {
		accessibleAlert("Volumen ajustado al " + (~~(this.volume * 100)).toString() + "%.", wrap);
	};
	audioElement.onerror = function () {
		alert("Error al cargar el audio " + titulo + ". Código de error: " + audioElement.error.code + ".");
	};
	audioElement.ontimeupdate = function () {
		wrap.find(".ddPosicion").html(getTiempo(this.currentTime));
	};
	audioElement.onpause = function () {
		wrap.find(".btnPlay").html("Reproducir" + agregaTitulo(titulo, "el audio"));
	};
	agregaControlesAccesibles(wrap);
}
	

function agregaControlesAccesibles(audioWrapper) {
	var audioElement = audioWrapper.find("audio:first");
	var titulo = audioElement.attr("data-title");
	if (audioWrapper.find(".controlesReproductor").length == 0) {
		var btnPlay = jQuery('<a href="#" class="btnPlayerControl btnPlay" >Reproducir' + agregaTitulo(titulo, 'el audio') + '</a>');
		var btnMute = jQuery('<a href="#" class="btnPlayerControl btnMute" >Desactivar / activar sonido' + agregaTitulo(titulo, 'al episodio') + '</a>');
		var btnVolumeDown = jQuery('<a href="#" class="btnPlayerControl btnVolumeDown" >Bajar volumen' + agregaTitulo(titulo, 'al audio') + '</a>');
		var btnVolumeUp = jQuery('<a href="#" class="btnPlayerControl btnVolumeUp" >Subir volumen' + agregaTitulo(titulo, 'al audio') + '</a>');
		var btnFw30Secs = jQuery('<a href="#" class="btnPlayerControl btnFw30Secs" >Avanzar treinta segundos' + agregaTitulo(titulo, 'en el audio') + '</a>');
		var btnBw30Secs = jQuery('<a href="#" class="btnPlayerControl btnBw30Secs" >Retroceder treinta segundos' + agregaTitulo(titulo, 'en el audio') + '</a>');
		var dlInfo = jQuery('<dl></dl>');
		var dtPosicion = jQuery('<dt>PosiciÃ³n:</dt>');
		var ddPosicion = jQuery('<dd class=\"ddPosicion\">0 segundos</dd>');
		var dtDuracion = jQuery('<dt>DuraciÃ³n:</dt>');
		var ddDuracion = jQuery('<dd class=\"ddDuracion\">Desconocida</dd>');
		var ul = jQuery("<ul></ul>"), liPlay = jQuery('<li class="liControl"></li>'), liMute = jQuery('<li class="liControl"></li>'), liVolumeDown = jQuery('<li class="liControl"></li>'), liVolumeUp = jQuery('<li class="liControl"></li>'), liFw30Secs = jQuery('<li class="liControl"></li>'), liBw30Secs = jQuery('<li class="liControl"></li>');
		var capaControles = jQuery("<div class=\"controlesReproductor sr-only\"></div>");
		capaControles.insertBefore(audioElement);
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
				var lnkDescargar = jQuery('<a class="lnkDescargar" href="' + url + '">Descargar' + agregaTitulo(titulo, "el audio", true) + '</a>');
				var pLnkDescargar = jQuery("<p></p>");
				pLnkDescargar.append(lnkDescargar);
				pLnkDescargar.insertBefore(capaControles);
			}
		}
		capaControles.append(ul);
		liPlay.append(btnPlay);
		ul.append(liPlay);
		// en iPhone, el volumen del audio no se puede controlar por javascript, así que quitamos los botones
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
		dlInfo.append(dtPosicion);
		dlInfo.append(ddPosicion);
		dlInfo.append(dtDuracion);
		dlInfo.append(ddDuracion);
		dlInfo.insertAfter(ul);
		// si no es iPhone, ponemos rol botón
		if (!navigator.userAgent.match(/(iPod|iPhone|iPad)/)) { ul.find(".btnPlayerControl").attr("role", "button"); }
	}
}

jQuery(function() {
	jQuery("html").on("click", ".btnPlay", function (e) {
		e.preventDefault();
		var wraper = jQuery(this).parents(".wrapRepro");
		var audioElement = wraper.find("audio");
		audioElement = audioElement[0];
		if (audioElement.paused) {
			audioElement.play();
		}
		else {
			audioElement.pause();
		}
	});
	jQuery("html").on("click", ".btnMute", function (e) {
		e.preventDefault();
		var wraper = jQuery(this).parents(".wrapRepro");
		var audioElement = wraper.find("audio");
		var titulo = audioElement.attr("data-title");
		audioElement = audioElement[0];
		if (audioElement.muted) {
			jQuery(this).html('Silenciar' + agregaTitulo(titulo, 'el audio'));
		}
		else {
			jQuery(this).html('Activar sonido' + agregaTitulo(titulo, 'al episodio'));
		}
		audioElement.muted = !audioElement.muted;
	});
	jQuery("html").on("click", ".btnVolumeUp", function (e) {
		e.preventDefault();
		var wrapper = jQuery(this).parents(".wrapRepro");
		var audioElement = wrapper.find("audio")[0];
		if (audioElement.volume == 100.0) return;
		if (audioElement.volume > 0.9) audioElement.volume = 1;
		else audioElement.volume += 0.1;
	});

	jQuery("html").on("click", ".btnVolumeDown", function (e) {
		e.preventDefault();
		var wrapper = jQuery(this).parents(".wrapRepro:first");
		var audioElement = wrapper.find("audio")[0];
		if (audioElement.volume == 0.0) return;
		if (audioElement.volume < 0.1) audioElement.volume = 0;
		else audioElement.volume -= 0.1;
	});
	jQuery("html").on("click", ".btnFw30Secs", function (e) {
		e.preventDefault();
		var wrapper = jQuery(this).parents(".wrapRepro:first");
		var audioElement = wrapper.find("audio")[0];
		if (audioElement.currentTime + 30 > audioElement.duration) audioElement.currentTime = audioElement.duration;
		else audioElement.currentTime += 30;
	});
	jQuery("html").on("click", ".btnBw30Secs", function (e) {
		e.preventDefault();
		var wrapper = jQuery(this).parents(".wrapRepro:first");
		var audioElement = wrapper.find("audio")[0];
		if (audioElement.currentTime - 30 < 0) audioElement.currentTime = 0;
		else audioElement.currentTime -= 30;
	});
	cargaReproductores();
});