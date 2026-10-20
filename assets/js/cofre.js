/* =================== Lógica del recurso "Abre el cofre" =================== */
(function () {
  "use strict";

  const COFRES = {
    A: { tecnica: "Intercalado", icono: "bi-shuffle",
         texto: "Y dentro de cada sesión, en vez de quedarte en un solo subtema hasta agotarlo, vas a alternar entre al menos 2 subtemas o tipos de ejercicio distintos —eso es intercalado—." },
    B: { tecnica: "Mnemotécnica", icono: "bi-lightbulb",
         texto: "Y en algún punto de tu plan, vas a crear un pequeño truco de memoria (una rima, una imagen, un acróstico) que te ayude a conectar una sesión con la otra —eso es mnemotécnica—." }
  };
  const RICOS = ["cfApl1", "cfApl2"];          // campos con editor de formato
  const esRico = id => RICOS.includes(id);
  const CAMPOS = [
    ["cfContenido", "Contenido elegido"],
    ["cfDia1", "Sesión 1 — Día"],
    ["cfApl1", "Sesión 1 — Aplicación"],
    ["cfDia2", "Sesión 2 — Día"],
    ["cfApl2", "Sesión 2 — Aplicación"]
  ];

  // Estado solo en memoria: al recargar la página el recurso empieza de cero.
  const estado = { pantalla: 1, cofre: null, mapa: null };

  const $ = id => document.getElementById(id);
  const pantallas = document.querySelectorAll(".cf-screen");
  const pasos = document.querySelectorAll("#cfSteps li");

  function ir(n, permitirVolver = false) {
    if (n < estado.pantalla && !permitirVolver) return;   // no se permite retroceder
    estado.pantalla = n;
    pantallas.forEach(s => s.classList.toggle("is-active", Number(s.dataset.screen) === n));
    pasos.forEach((li, i) => {
      li.classList.toggle("is-done", i + 1 < n);
      li.classList.toggle("is-current", i + 1 === n);
      li.setAttribute("aria-current", i + 1 === n ? "step" : "false");
    });
    if (n === 3 || n === 4) pintarCofre();
    if (n === 5) pintarMapa();
    // Desde la elección se oculta la portada; en la elección el escenario ocupa toda la pantalla
    document.body.classList.toggle("cf-inmersivo", n > 1);
    document.body.classList.toggle("cf-escena", n === 2);
    medirHeader();
    const headerH = document.getElementById("header").offsetHeight;
    const top = $("seccion2").getBoundingClientRect().top + window.scrollY - headerH;
    if (n > 1) window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  // Alto del menú superior, para que el escenario de los cofres llene el resto de la pantalla
  function medirHeader() {
    const raiz = document.documentElement.style, footer = document.getElementById("footer");
    raiz.setProperty("--cf-header-h", document.getElementById("header").offsetHeight + "px");
    if (footer) {
      const cs = getComputedStyle(footer);
      raiz.setProperty("--cf-footer-h", footer.offsetHeight + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom) + "px");
    }
  }
  window.addEventListener("resize", medirHeader);

  // ---------- Portada: red animada y botón para empezar ----------
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function redPortada() {
    const canvas = $("cfNeural");
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const LINK = 130;
    let nodos = [], pulsos = [], w, h, corriendo = false, visible = true;
    function medir() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      if (!w || !h) return;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const total = Math.round(Math.min(48, (w * h) / 20000));
      nodos = Array.from({ length: total }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, r: Math.random() * 1.6 + .8
      }));
    }
    function pulso() {
      const a = nodos[Math.floor(Math.random() * nodos.length)];
      let mejor = null, md = Infinity;
      nodos.forEach(b => { if (b === a) return; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < LINK && d < md) { md = d; mejor = b; } });
      if (mejor) pulsos.push({ a, b: mejor, t: 0 });
    }
    function dibujar() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodos.length; i++) {
        const n = nodos[i];
        if (!reduceMotion) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
        }
        for (let j = i + 1; j < nodos.length; j++) {
          const m = nodos[j], d = Math.hypot(n.x - m.x, n.y - m.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(150,175,255,${.22 * (1 - d / LINK)})`; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y); ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(200,215,255,.7)";
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
      // destellos dorados que viajan entre los nodos (el brillo del tesoro)
      for (let k = pulsos.length - 1; k >= 0; k--) {
        const p = pulsos[k]; p.t += .018;
        if (p.t >= 1) { pulsos.splice(k, 1); continue; }
        const x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, "rgba(255,226,140,1)"); g.addColorStop(1, "rgba(245,184,28,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
      }
      if (reduceMotion) return;
      if (Math.random() < .05 && pulsos.length < 10) pulso();
      if (visible && !document.hidden && !document.body.classList.contains("cf-inmersivo")) requestAnimationFrame(dibujar);
      else corriendo = false;
    }
    function iniciar() {
      if (corriendo || reduceMotion || !w) return;
      corriendo = true; requestAnimationFrame(dibujar);
    }
    medir();
    if (reduceMotion) { if (w) dibujar(); } else iniciar();
    let t; window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { medir(); iniciar(); }, 200); });
    document.addEventListener("visibilitychange", iniciar);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(e => { visible = e[0].isIntersecting; if (visible) { if (!w) medir(); iniciar(); } }).observe(canvas);
    }
  }
  redPortada();
  if ($("cfHeroCta")) $("cfHeroCta").addEventListener("click", () => {
    const headerH = document.getElementById("header").offsetHeight;
    const top = $("seccion2").getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
    setTimeout(() => { const b = $("cfToChests"); if (b) b.focus({ preventScroll: true }); }, reduceMotion ? 0 : 600);
  });

  // ---------- Pantalla 1 ----------
  $("cfToChests").addEventListener("click", () => ir(2));

  // ---------- Pantalla 2: elegir cofre ----------
  const cofresBtns = document.querySelectorAll(".cf-chests .cf-chest");
  cofresBtns.forEach(btn => btn.addEventListener("click", () => {
    if (estado.cofre) return;
    estado.cofre = btn.dataset.cofre;
    cofresBtns.forEach(b => {
      b.disabled = true;
      b.querySelector(".cf-chest-hint").textContent = b === btn ? "¡Abierto!" : "Ya no está disponible";
      b.classList.add(b === btn ? "is-open" : "is-locked");
    });
    setTimeout(() => ir(3), 1400);
  }));

  // ---------- Pantalla 3: revelación ----------
  function pintarCofre() {
    const c = COFRES[estado.cofre]; if (!c) return;
    $("cfTech2").innerHTML = `<i class="bi ${c.icono}"></i> ${c.tecnica}`;
    $("cfTech2Text").textContent = c.texto;
    $("cfMiniCombo").textContent = $("cfMiniCombo2").textContent = "Espaciado + " + c.tecnica;
  }
  $("cfToForm").addEventListener("click", () => ir(4));

  // ---------- Pantalla 4: tabla ----------
  // Días: al hacer clic en la celda se abre el selector de fecha
  document.querySelectorAll(".cf-date").forEach(inp => {
    inp.addEventListener("click", () => { try { inp.showPicker && inp.showPicker(); } catch (e) {} });
  });

  if (window.CFEditor) RICOS.forEach(id => window.CFEditor.init($(id)));
  const lleno = id => esRico(id)
    ? (window.CFEditor ? window.CFEditor.texto($(id)) : $(id).textContent.trim()) !== ""
    : $(id).value.trim() !== "";
  function revisar() {
    let n = 0;
    CAMPOS.forEach(([id]) => {
      const ok = lleno(id); if (ok) n++;
      const tr = $(id).closest("tr");
      tr.classList.toggle("is-filled", ok);
      if (ok) tr.classList.remove("has-error");
    });
    $("cfCount").textContent = `${n} de 5 campos diligenciados`;
    $("cfCountBar").style.width = (n / 5 * 100) + "%";
    $("cfSubmit").disabled = n < 5;
  }
  CAMPOS.forEach(([id]) => ["input", "change"].forEach(ev => $(id).addEventListener(ev, revisar)));

  $("cfForm").addEventListener("submit", e => {
    e.preventDefault();
    const faltan = CAMPOS.filter(([id]) => !lleno(id));
    if (faltan.length) {
      faltan.forEach(([id]) => $(id).closest("tr").classList.add("has-error"));
      $(faltan[0][0]).focus();
      return;
    }
    estado.mapa = {};
    CAMPOS.forEach(([id]) => {
      if (esRico(id)) {
        const modelo = window.CFEditor.modelo($(id));
        estado.mapa[id] = { modelo, html: window.CFEditor.html(modelo), texto: window.CFEditor.texto($(id)) };
      } else estado.mapa[id] = $(id).value.trim();
    });
    ir(5);
    marcarCompletado();
    abrirModal();
  });

  // ---------- Pop-up de mapa terminado ----------
  function abrirModal() {
    const conf = $("cfConfetti"); conf.innerHTML = "";
    const colores = ["#000087", "#3037bc", "#5882f8", "#9fb6ff", "#e8eeff"];
    for (let i = 0; i < 40; i++) {
      const s = document.createElement("span");
      s.style.left = Math.random() * 100 + "%";
      s.style.background = colores[i % colores.length];
      s.style.setProperty("--delay", (Math.random() * .8) + "s");
      conf.appendChild(s);
    }
    $("cfModal").classList.add("is-open");
    $("cfModalOk").focus();
  }
  function cerrarModal() { $("cfModal").classList.remove("is-open"); }
  $("cfModalOk").addEventListener("click", cerrarModal);
  $("cfModal").addEventListener("click", e => { if (e.target.id === "cfModal") cerrarModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarModal(); });

  // ---------- Estrellas que titilan en la pantalla de cofres ----------
  document.querySelectorAll(".cf-stars").forEach(cont => {
    const total = Number(cont.dataset.estrellas) || 20;
    for (let i = 0; i < total; i++) {
      const s = document.createElement("span");
      s.className = "cf-star";
      s.textContent = i % 3 === 0 ? "✦" : "✧";
      s.style.left = Math.random() * 96 + "%";
      s.style.top = Math.random() * 92 + "%";
      s.style.fontSize = (8 + Math.random() * 14) + "px";
      s.style.setProperty("--d", (2 + Math.random() * 3).toFixed(2) + "s");
      s.style.setProperty("--delay", (-Math.random() * 5).toFixed(2) + "s");
      cont.appendChild(s);
    }
  });

  // ---------- Pantalla 5: cierre y descarga ----------
  const fecha = v => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v || "")) return v || "";
    const [y, m, d] = v.split("-").map(Number);
    const t = new Date(y, m - 1, d).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    return t.charAt(0).toUpperCase() + t.slice(1);
  };
  const valor = id => id.startsWith("cfDia") ? fecha(estado.mapa[id]) : esRico(id) ? estado.mapa[id].texto : estado.mapa[id];

  function pintarMapa() {
    CAMPOS.forEach(([id]) => {
      if (esRico(id)) $("out_" + id).innerHTML = estado.mapa[id].html;   // HTML ya limpio (editor-texto.js)
      else $("out_" + id).textContent = valor(id);
    });
  }

  // Editar: solo se permite volver de la pantalla 5 a la tabla (pantalla 4)
  $("cfEdit").addEventListener("click", () => { if (estado.pantalla === 5) ir(4, true); });

  // Ícono 🗺️ como imagen para el PDF (las fuentes del PDF no traen emojis)
  function iconoMapa(px) {
    const c = document.createElement("canvas"); c.width = c.height = px;
    const g = c.getContext("2d");
    g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `${Math.round(px * .8)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    g.fillText("🗺️", px / 2, px / 2 + px * .04);
    const d = g.getImageData(0, 0, px, px).data;
    let pintado = false;
    for (let i = 3; i < d.length; i += 16) if (d[i] > 0) { pintado = true; break; }
    if (!pintado) {                       // respaldo: mapa plegado dibujado
      const u = px / 10;
      g.lineJoin = "round"; g.lineWidth = u * .35; g.strokeStyle = "#1d5b3a";
      const pan = [[1,2.2,3.7,1.4,3.7,7.8,1,8.6,"#8fd18a"],[3.7,1.4,6.3,2.2,6.3,8.6,3.7,7.8,"#6fbf73"],[6.3,2.2,9,1.4,9,7.8,6.3,8.6,"#8fd18a"]];
      pan.forEach(([x1,y1,x2,y2,x3,y3,x4,y4,col]) => {
        g.beginPath(); g.moveTo(x1*u,y1*u); g.lineTo(x2*u,y2*u); g.lineTo(x3*u,y3*u); g.lineTo(x4*u,y4*u); g.closePath();
        g.fillStyle = col; g.fill(); g.stroke();
      });
      g.fillStyle = "#3a7bd5"; g.beginPath(); g.arc(5, 5, u*.9, 0, Math.PI*2); g.fill();
    }
    return c.toDataURL("image/png");
  }

  // ---------- PDF del mapa sobre la plantilla "Aprender a aprender" ----------
  // Medidas tomadas del Word de la plantilla (carta, puntos): el banner va en el encabezado de todas
  // las páginas, la franja azul en el pie con el número de página y márgenes laterales de 85 pt.
  const PLANTILLA = {
    unidad: "Unidad 2",
    experto: "Experto temático: Mateo Muñetones Rico.",
    margen: 85, arriba: 165, abajo: 92
  };
  const AZUL = [0, 0, 135], MORADO = [130, 36, 211], MORADO_PAG = [112, 48, 160];

  function registrarFuente(doc) {
    const R = window.CF_PDF;
    if (!R || !R.fuenteRegular) return "helvetica";
    doc.addFileToVFS("Carlito-Regular.ttf", R.fuenteRegular);
    doc.addFont("Carlito-Regular.ttf", "Calibri", "normal");
    doc.addFileToVFS("Carlito-Bold.ttf", R.fuenteNegrita);
    doc.addFont("Carlito-Bold.ttf", "Calibri", "bold");
    if (R.fuenteCursiva) {
      doc.addFileToVFS("Carlito-Italic.ttf", R.fuenteCursiva);
      doc.addFont("Carlito-Italic.ttf", "Calibri", "italic");
      doc.addFileToVFS("Carlito-BoldItalic.ttf", R.fuenteNegritaCursiva);
      doc.addFont("Carlito-BoldItalic.ttf", "Calibri", "bolditalic");
    }
    return "Calibri";
  }

  // Insignia: círculo azul claro con borde azul y el ícono 🗺️
  function insignia(doc, cx, cy, r, ico) {
    doc.setFillColor(232, 238, 252); doc.circle(cx, cy, r, "F");
    doc.setDrawColor(255, 255, 255); doc.setLineWidth(3); doc.circle(cx, cy, r, "S");
    doc.setDrawColor(0, 0, 135); doc.setLineWidth(1); doc.circle(cx, cy, r + 2.2, "S");
    const t = r * 1.2; doc.addImage(ico, "PNG", cx - t / 2, cy - t / 2, t, t);
  }

  // ---------- Texto con formato en el PDF ----------
  // Recibe bloques (párrafos o ítems de lista con fragmentos de estilo) y los parte en líneas
  // que caben en un ancho dado. Cada línea guarda sus fragmentos ya posicionados.
  const PDF_FS = 11.5, PDF_LH = 15, TINTA = [27, 27, 27], ENLACE = [47, 98, 232];
  function estiloFuente(F, r) {
    if (F === "helvetica") return r.b && r.i ? "bolditalic" : r.b ? "bold" : r.i ? "italic" : "normal";
    const tieneCursiva = !!(window.CF_PDF && window.CF_PDF.fuenteCursiva);
    if (!tieneCursiva) return r.b ? "bold" : "normal";
    return r.b && r.i ? "bolditalic" : r.b ? "bold" : r.i ? "italic" : "normal";
  }
  function medir(doc, F, r, t) { doc.setFont(F, estiloFuente(F, r)); doc.setFontSize(PDF_FS); return doc.getTextWidth(t); }

  function lineasRicas(doc, F, bloques, ancho) {
    const lineas = [];
    bloques.forEach((b, bi) => {
      const sangria = b.list ? 18 + 14 * (Math.max(1, b.level) - 1) : 0;
      const util = ancho - sangria;
      let actual = [], x = 0, primera = true;
      const cerrar = (forzada) => {
        while (actual.length && !actual[actual.length - 1].text.trim()) { x -= actual.pop().w; }
        lineas.push({ h: PDF_LH, segs: actual, x0: sangria, ancho: util, w: x, align: b.align, ultima: false,
                      vineta: primera && b.list ? (b.list === "ul" ? (b.level > 1 ? "–" : "•") : b.num + ".") : null, forzada });
        actual = []; x = 0; primera = false;
      };
      const poner = (texto, r) => {
        const w = medir(doc, F, r, texto);
        actual.push({ text: texto, w, r }); x += w;
      };
      b.runs.forEach(r => {
        if (r.br) { cerrar(true); return; }
        r.text.split(/( +)/).forEach(tok => {
          if (!tok) return;
          const espacio = !tok.trim();
          if (espacio) { if (actual.length) poner(" ", r); return; }
          let w = medir(doc, F, r, tok);
          if (x + w > util && actual.length) cerrar(false);
          // palabra más larga que el ancho: se parte por letras
          while (w > util) {
            let n = tok.length;
            while (n > 1 && medir(doc, F, r, tok.slice(0, n)) > util - x) n--;
            poner(tok.slice(0, n), r); cerrar(false);
            tok = tok.slice(n); w = medir(doc, F, r, tok);
          }
          if (tok) poner(tok, r);
        });
      });
      if (actual.length || primera || !lineas.length || true) cerrar(false);
      lineas[lineas.length - 1].ultima = true;
      if (bi < bloques.length - 1) lineas[lineas.length - 1].h += b.list && bloques[bi + 1].list ? 2 : 5;
    });
    return lineas;
  }

  function dibujarLinea(doc, F, l, x, y) {
    // y = borde superior de la línea
    const base = y + PDF_FS * .86;
    let extra = 0, dx = 0;
    const libre = l.ancho - l.w;
    if (l.align === "center") dx = libre / 2;
    else if (l.align === "right") dx = libre;
    else if (l.align === "justify" && !l.ultima && !l.forzada) {
      const esp = l.segs.filter(s => s.text === " ").length;
      if (esp) extra = libre / esp;
    }
    if (l.vineta) {
      doc.setFont(F, "normal"); doc.setFontSize(PDF_FS); doc.setTextColor(...TINTA);
      doc.text(l.vineta, x + l.x0 - 5, base, { align: "right" });
    }
    let cx = x + l.x0 + dx;
    l.segs.forEach(s => {
      const w = s.w + (s.text === " " ? extra : 0), r = s.r;
      if (r.bg) { doc.setFillColor(...r.bg); doc.rect(cx, y + 1, w + .2, PDF_LH - 1.5, "F"); }
      const col = r.color || (r.href ? ENLACE : TINTA);
      if (s.text !== " ") {
        doc.setFont(F, estiloFuente(F, r)); doc.setFontSize(PDF_FS); doc.setTextColor(...col);
        doc.text(s.text, cx, base);
      }
      if (r.u || r.href) { doc.setDrawColor(...col); doc.setLineWidth(.6); doc.line(cx, base + 1.6, cx + w, base + 1.6); }
      if (r.href) doc.link(cx, y, w, PDF_LH, { url: r.href });
      cx += w;
    });
  }

  // Tabla del mapa dibujada a mano para poder llevar texto con formato y partir filas largas entre páginas
  function tablaPDF(doc, F, filas, y0, M, ancho, H) {
    const w0 = 140, w1 = ancho - w0, pad = 9, hdrH = 27;
    const arriba = PLANTILLA.arriba, abajo = H - PLANTILLA.abajo;
    const borde = [210, 216, 236];
    const alto = ls => ls.reduce((s, l) => s + l.h, 0);
    function encabezado(y) {
      doc.setFillColor(...AZUL); doc.rect(M, y, ancho, hdrH, "F");
      doc.setFont(F, "bold"); doc.setFontSize(PDF_FS); doc.setTextColor(255, 255, 255);
      doc.text("Campo", M + pad, y + 17.5); doc.text("Mi plan", M + w0 + pad, y + 17.5);
      return y + hdrH;
    }
    function fila(y, h, lab, con, i) {
      doc.setFillColor(240, 243, 252); doc.rect(M, y, w0, h, "F");
      doc.setFillColor(...(i % 2 ? [255, 255, 255] : [248, 249, 252])); doc.rect(M + w0, y, w1, h, "F");
      doc.setDrawColor(...borde); doc.setLineWidth(.8);
      doc.rect(M, y, ancho, h, "S"); doc.line(M + w0, y, M + w0, y + h);
      let ly = y + pad;
      if (lab) lab.forEach(l => { dibujarLinea(doc, F, l, M + pad, ly); ly += l.h; });
      let cy = y + pad;
      con.forEach(l => { dibujarLinea(doc, F, l, M + w0 + pad, cy); cy += l.h; });
    }
    let y = encabezado(y0);
    filas.forEach((f, i) => {
      const lab = lineasRicas(doc, F, [{ runs: [{ text: f.label, b: true, color: AZUL }] }], w0 - 2 * pad);
      let resto = lineasRicas(doc, F, f.bloques, w1 - 2 * pad), primero = true;
      const paginaLlena = abajo - (arriba + hdrH) - 2 * pad;
      for (let guard = 0; guard < 50; guard++) {
        const disponible = abajo - y - 2 * pad;
        const necesita = Math.max(primero ? alto(lab) : 0, alto(resto));
        if (necesita <= disponible) { fila(y, necesita + 2 * pad, primero ? lab : null, resto, i); y += necesita + 2 * pad; break; }
        // si la fila completa cabe en una hoja nueva, se pasa entera; si no, se parte por líneas
        if ((primero && necesita <= paginaLlena) || disponible < Math.max(3 * PDF_LH, primero ? alto(lab) : 0)) {
          doc.addPage(); y = encabezado(arriba); continue;
        }
        let acc = 0, k = 0;
        while (k < resto.length && acc + resto[k].h <= disponible) acc += resto[k++].h;
        if (!k) { doc.addPage(); y = encabezado(arriba); continue; }
        const h = Math.max(primero ? alto(lab) : 0, acc) + 2 * pad;
        fila(y, h, primero ? lab : null, resto.slice(0, k), i);
        resto = resto.slice(k); primero = false;
        doc.addPage(); y = encabezado(arriba);
      }
    });
    return y;
  }

  $("cfDownload").addEventListener("click", () => {
    if (!(window.jspdf && window.jspdf.jsPDF)) { window.print(); return; }   // respaldo
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const R = window.CF_PDF || {};
    const F = registrarFuente(doc);
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
    const M = PLANTILLA.margen, ancho = W - 2 * M;
    const combo = "Espaciado + " + COFRES[estado.cofre].tecnica;
    const ico = iconoMapa(128);

    // Página 1: unidad y experto temático, igual que en la plantilla
    doc.setFont(F, "bold"); doc.setFontSize(20); doc.setTextColor(...AZUL);
    doc.text(PLANTILLA.unidad, M, 186.7);
    doc.setFontSize(16); doc.setTextColor(...MORADO);
    doc.text(PLANTILLA.experto, M, 213.7);

    // Título del recurso con la insignia
    let y = 263;
    doc.setDrawColor(223, 227, 240); doc.setLineWidth(0.8); doc.line(M, y - 22, W - M, y - 22);
    doc.setFont(F, "bold"); doc.setFontSize(18); doc.setTextColor(...AZUL);
    doc.text("Mi mapa de estudio", M, y + 4);
    doc.setFontSize(12); doc.setTextColor(27, 27, 27);
    const lab = "Combinación de técnicas:";
    doc.text(lab, M, y + 26);
    doc.setFont(F, "normal"); doc.text(combo, M + doc.getTextWidth(lab) + 4, y + 26);
    insignia(doc, W - M - 30, y + 8, 26, ico);

    // Tabla del mapa (los campos de aplicación conservan su formato)
    const filas = CAMPOS.map(([id, label]) => ({
      label,
      bloques: esRico(id) ? estado.mapa[id].modelo : [{ runs: [{ text: valor(id), b: id === "cfContenido" }] }]
    }));
    tablaPDF(doc, F, filas, y + 52, M, ancho, H);

    // Banner, pie y número de página en todas las hojas
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      if (R.banner) doc.addImage(R.banner, "JPEG", -2.4, 0, 613.5, 141);
      if (R.pie) doc.addImage(R.pie, "JPEG", 0, H - 23.25, W, 23.25);
      doc.setFont(F, "bold"); doc.setFontSize(11); doc.setTextColor(...MORADO_PAG);
      doc.text(String(p), W / 2, 749.4, { align: "center" });
    }
    doc.save("mi-mapa-de-estudio.pdf");
  });

  // ---------- Marcar completado ante el LMS (SCORM 1.2 / 2004 si existe) ----------
  function buscarAPI(nombre) {
    let w = window, n = 0;
    while (w && n < 10) {
      if (w[nombre]) return w[nombre];
      if (w.parent && w.parent !== w) w = w.parent; else if (w.opener) w = w.opener; else break;
      n++;
    }
    return null;
  }
  function marcarCompletado() {
    try {
      const api2004 = buscarAPI("API_1484_11");
      if (api2004) {
        api2004.Initialize("");
        api2004.SetValue("cmi.completion_status", "completed");
        api2004.Commit("");
      } else {
        const api12 = buscarAPI("API");
        if (api12) {
          api12.LMSInitialize("");
          api12.LMSSetValue("cmi.core.lesson_status", "completed");
          api12.LMSCommit("");
        }
      }
    } catch (e) { /* sin LMS disponible */ }
    try { window.parent.postMessage({ tipo: "recurso-completado", recurso: "abre-el-cofre", insignia: "El Mapa" }, "*"); } catch (e) {}
  }

  revisar();
  pantallas.forEach(s => s.classList.toggle("is-active", s.dataset.screen === "1"));
  pasos[0].classList.add("is-current");
})();
