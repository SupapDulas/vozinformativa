document.addEventListener("DOMContentLoaded", () => {
  const popup        = document.getElementById("popup-accesibilidad");
  const enlaces      = document.querySelectorAll(".menu a");
  const secciones    = Array.from(document.querySelectorAll(".seccion"));
  let popupActivo    = true;
  let modoAccesible  = false;
  let accesibilidadActiva = false;
  let seccionIndex   = 0;
  let titulares      = [];
  let idxTitular     = -1;
  let modoTitulares  = false;
  let mensaje        = "¿Presenta discapacidad visual? Presione barra espaciadora para sí, o F para no.";
  let mensajeLeido   = false;
  let repetidor;
  let lastSpaceTime  = 0;

  function leer(texto) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-ES";
    window.speechSynthesis.speak(u);
  }

  function activarAccesibilidad() {
    modoAccesible = true;
    accesibilidadActiva = true;
    //document.body.classList.add("modo-noche", "fuente-grande", "alto-contraste");
    localStorage.setItem("discapacidadVisual", "si");
    seccionIndex = 0;
    enfocarSeccion(seccionIndex);
  }

  function enfocarSeccion(i) {
    const sec = secciones[i];
    const tituloSec = sec.querySelector("h2")?.innerText || "sin título";

    secciones.forEach(s => {
      s.classList.remove("visible", "seccion-activa");
      s.style.backgroundColor = "";
    });
    sec.classList.add("visible", "seccion-activa");
    sec.style.backgroundColor = "#ffffcc";
    sec.scrollIntoView({ behavior: "smooth", block: "center" });

    enlaces.forEach(a => a.classList.remove("activo"));
    const enlace = document.querySelector(`.menu a[href="#${sec.id}"]`);
    if (enlace) enlace.classList.add("activo");

    titulares = Array.from(sec.querySelectorAll("h3"));
    idxTitular = -1;

    secciones.forEach(s => s.querySelectorAll("h3").forEach(h => {
      h.style.outline = "";
      h.style.backgroundColor = "";
    }));

    const instr = `Sección ${tituloSec}. Presione J para avanzar sección, F para retroceder sección, barra espaciadora para entrar a titulares, doble espacio para abrir video si existe, y número 5 para regresar al índice.`;
    sec.dataset.instruccion = instr;
    leer(instr);
  }

  function avanzarTitular() {
    if (!titulares.length) {
      leer("No hay titulares en esta sección.");
      return;
    }
    titulares.forEach(t => {
      t.style.outline = "";
      t.style.backgroundColor = "";
    });

    idxTitular = (idxTitular + 1) % titulares.length;

    const actual = titulares[idxTitular];
    actual.style.outline = "3px solid red";
    actual.style.backgroundColor = "#ffe6e6";
    actual.scrollIntoView({ behavior: "smooth", block: "center" });

    const textoP = actual.nextElementSibling?.innerText || "";
    leer(`${actual.innerText}. ${textoP}`);
  }

  function retrocederTitular() {
    if (!titulares.length) {
      leer("No hay titulares en esta sección.");
      return;
    }
    titulares.forEach(t => {
      t.style.outline = "";
      t.style.backgroundColor = "";
    });

    idxTitular = (idxTitular - 1 + titulares.length) % titulares.length;

    const actual = titulares[idxTitular];
    actual.style.outline = "3px solid red";
    actual.style.backgroundColor = "#ffe6e6";
    actual.scrollIntoView({ behavior: "smooth", block: "center" });

    const textoP = actual.nextElementSibling?.innerText || "";
    leer(`${actual.innerText}. ${textoP}`);
  }

  function moverSeccion(dir) {
    seccionIndex = (seccionIndex + dir + secciones.length) % secciones.length;
    enfocarSeccion(seccionIndex);
  }

  enlaces.forEach(enlace => {
    enlace.addEventListener("click", e => {
      e.preventDefault();
      enlaces.forEach(a => a.classList.remove("activo"));
      enlace.classList.add("activo");
      secciones.forEach(sec => sec.classList.remove("visible"));
      const id = enlace.getAttribute("href").substring(1);
      const destino = document.getElementById(id);
      if (destino) destino.classList.add("visible");
    });
  });

  function leerMensajePeriodicamente() {
    repetidor = setInterval(() => {
      if (!mensajeLeido && popup) {
        leer(mensaje);
      } else {
        clearInterval(repetidor);
      }
    }, 10000);
  }

 document.addEventListener("keydown", e => {
  const key = e.key.toLowerCase();
  const ahora = Date.now();

  if (popupActivo && (e.code === "Space" || key === "f")) {
    popup.remove();
    popupActivo = false;
    mensajeLeido = true;
    clearInterval(repetidor);
    if (e.code === "Space") {
      activarAccesibilidad();
    } else {
      leer("Bienvenido. Puede navegar normalmente con ratón o teclado.");
    }
    return;
  }

  if (!modoAccesible) return;

  if (!modoTitulares) {
    if (key === "j") {
      moverSeccion(1);
    }
    else if (key === "f") {
      moverSeccion(-1);
    }
    else if (e.code === "Space") {
      e.preventDefault();
      modoTitulares = true;
      idxTitular = -1;
      avanzarTitular();
      leer("Entraste a titulares. Usa J para siguiente, F para anterior, barra espaciadora para reproducir o pausar video si existe, y 5 para volver al índice.");
    }
  } else {
    if (key === "j") {
      avanzarTitular();
    }
    else if (key === "f") {
      retrocederTitular();
    }
    else if (e.code === "Space") {
      e.preventDefault();

      let video = null;
      if (idxTitular >= 0 && titulares[idxTitular]) {
        const article = titulares[idxTitular].closest("article");
        video = article?.querySelector("video");
      }

      if (video) {
        if (video.paused) {
          video.play();
          leer("Reproduciendo video de este subtítulo.");
        } else {
          video.pause();
          leer("Video en pausa.");
        }
      } else {
        leer("No hay video disponible en este subtítulo.");
      }

      lastSpaceTime = ahora;
    }
    else if (key === "5") {
      modoTitulares = false;
      enfocarSeccion(seccionIndex);
      leer("Regresaste al índice.");
    }
  }
});

  leer(mensaje);
  leerMensajePeriodicamente();
});
