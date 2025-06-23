document.addEventListener("DOMContentLoaded", function () {
  const enlaces = document.querySelectorAll('.menu a');
  const secciones = document.querySelectorAll('.seccion');

  enlaces.forEach(enlace => {
    enlace.addEventListener('click', function (e) {
      e.preventDefault();
      enlaces.forEach(a => a.classList.remove('activo'));
      this.classList.add('activo');
      secciones.forEach(sec => sec.classList.remove('visible'));
      const id = this.getAttribute('href').substring(1);
      const destino = document.getElementById(id);
      if (destino) destino.classList.add('visible');
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const popup = document.getElementById("popup-accesibilidad");
  let mensajeLeido = false;
  let accesibilidadActiva = false;
  let secciones = [];
  let indiceSeccion = 0;
  let mensaje = "¿Presenta discapacidad visual? Presione la tecla barra espaciadora para decir sí, de lo contrario presione la tecla F.";
  let repetidor;

  function leerMensaje() {
    const voz = new SpeechSynthesisUtterance(mensaje);
    voz.lang = "es-ES";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(voz);
  }

  repetidor = setInterval(() => {
    if (!mensajeLeido && popup) {
      leerMensaje();
    } else {
      clearInterval(repetidor);
    }
  }, 10000);

  document.addEventListener("keydown", function (e) {
    if (!mensajeLeido && popup) {
      leerMensaje();
      mensajeLeido = true;
      return;
    }

    if (!popup) {
      if (accesibilidadActiva) {
        if (e.key.toLowerCase() === "d") {
          avanzarSeccion();
        } else if (e.key.toLowerCase() === "a") {
          retrocederSeccion();
        } else if (e.key.toLowerCase() === "r") {
          leerMensaje();
        }
      }
      return;
    }

    if (e.code === "Space") {
      console.log("Usuario indicó que SÍ presenta discapacidad visual.");
      popup.remove();
      activarAccesibilidad();
    } else if (e.key.toLowerCase() === "f") {
      console.log("Usuario indicó que NO presenta discapacidad visual.");
      popup.remove();
    }
  });

  function activarAccesibilidad() {
    accesibilidadActiva = true;
    document.body.classList.add("modo-noche", "fuente-grande", "alto-contraste");
    localStorage.setItem("discapacidadVisual", "si");
    secciones = Array.from(document.querySelectorAll(".seccion"));
    if (secciones.length > 0) {
      indiceSeccion = 0;
      enfocarYLeerSeccion(secciones[indiceSeccion]);
    }
  }

  function enfocarYLeerSeccion(seccion) {
    secciones.forEach(s => s.classList.remove("seccion-activa"));
    seccion.classList.add("seccion-activa");
    seccion.scrollIntoView({ behavior: "smooth", block: "center" });
    const texto = seccion.innerText;
    const msg = new SpeechSynthesisUtterance(texto);
    msg.lang = "es-ES";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(msg); 
  }

  function avanzarSeccion() {
    if (indiceSeccion < secciones.length - 1) {
      indiceSeccion++;
      enfocarYLeerSeccion(secciones[indiceSeccion]);
    }
  }

  function retrocederSeccion() {
    if (indiceSeccion > 0) {
      indiceSeccion--;
      enfocarYLeerSeccion(secciones[indiceSeccion]);
    }
  }
});

function enfocar(i) {
  const s = secciones[i];

  // 1) Sección activa + visible
  secciones.forEach(sec => {
    sec.classList.remove("seccion-activa", "visible");
  });
  s.classList.add("seccion-activa", "visible");
  s.scrollIntoView({ behavior: "smooth", block: "start" });

  // 2) Actualizar el menú
  document
    .querySelectorAll(".menu a")
    .forEach(a => a.classList.remove("activo"));

  const enlace = document.querySelector(`.menu a[href="#${s.id}"]`);
  if (enlace) enlace.classList.add("activo");

  // 3) Leer título + primer párrafo
  const titulo = s.querySelector("h2")?.innerText || "";
  const parrafo = s.querySelector("p")?.innerText || "";
  leerTexto(`${titulo}. ${parrafo}`);
}
