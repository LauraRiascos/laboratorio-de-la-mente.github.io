/* =========================================================
   Editor de texto con formato para "Sesión 1/2 — Aplicación"
   Negrilla, cursiva, subrayado, resaltado, color de letra, enlace,
   viñetas, numeración, alineación y quitar formato.

   Expone window.CFEditor:
     init(area)    → convierte un div contenteditable en editor con barra
     texto(area)   → texto plano (para saber si el campo está lleno)
     modelo(area)  → bloques con fragmentos de estilo (para el PDF)
     html(modelo)  → HTML limpio y seguro (para mostrar el mapa)
   ========================================================= */
(function () {
  "use strict";

  const RESALTADOS = [
    ["Amarillo", "#fff176"], ["Verde", "#b9f6ca"], ["Celeste", "#b3e5fc"],
    ["Rosado", "#f8bbd0"], ["Naranja", "#ffe0b2"]
  ];
  const COLORES = [
    ["Azul UPB", "#000087"], ["Azul", "#2f62e8"], ["Rojo", "#c62828"],
    ["Verde", "#1e7d43"], ["Morado", "#8224d3"], ["Naranja", "#c25e00"]
  ];
  const ALINEAR = [
    ["justifyLeft", "bi-text-left", "Alinear a la izquierda"],
    ["justifyCenter", "bi-text-center", "Centrar"],
    ["justifyRight", "bi-text-right", "Alinear a la derecha"],
    ["justifyFull", "bi-justify", "Justificar"]
  ];

  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Barra de herramientas ----------
  function barraHTML(id, etiqueta) {
    const sw = (lista, tipo) => lista.map(([n, c]) =>
      `<button type="button" role="menuitem" class="cf-rte-sw" data-${tipo}="${c}" title="${n}" aria-label="${n}" style="--sw:${c}"></button>`).join("");
    return `
      <div class="cf-rte-bar" role="toolbar" aria-label="Formato del texto: ${esc(etiqueta)}" aria-controls="${id}">
        <button type="button" class="cf-rte-btn" data-cmd="bold" aria-pressed="false" title="Negrilla (Ctrl+B)" aria-label="Negrilla"><i class="bi bi-type-bold"></i></button>
        <button type="button" class="cf-rte-btn" data-cmd="italic" aria-pressed="false" title="Cursiva (Ctrl+I)" aria-label="Cursiva"><i class="bi bi-type-italic"></i></button>
        <button type="button" class="cf-rte-btn" data-cmd="underline" aria-pressed="false" title="Subrayado (Ctrl+U)" aria-label="Subrayado"><i class="bi bi-type-underline"></i></button>
        <div class="cf-rte-split" data-split="hl">
          <button type="button" class="cf-rte-btn" data-apply="hl" title="Resaltar" aria-label="Resaltar texto"><i class="bi bi-highlighter"></i><span class="cf-rte-line" style="--sw:#fff176"></span></button>
          <button type="button" class="cf-rte-btn cf-rte-caret" data-menu="hl" aria-haspopup="menu" aria-expanded="false" title="Color de resaltado" aria-label="Elegir color de resaltado"><i class="bi bi-chevron-down"></i></button>
          <div class="cf-rte-menu" role="menu" aria-label="Colores de resaltado">
            <div class="cf-rte-sws">${sw(RESALTADOS, "hl")}</div>
            <button type="button" role="menuitem" class="cf-rte-item" data-hl="none"><i class="bi bi-slash-circle"></i> Sin resaltado</button>
          </div>
        </div>
        <div class="cf-rte-split" data-split="fc">
          <button type="button" class="cf-rte-btn" data-apply="fc" title="Color de letra" aria-label="Color de letra"><span class="cf-rte-a">A</span><span class="cf-rte-line" style="--sw:#c62828"></span></button>
          <button type="button" class="cf-rte-btn cf-rte-caret" data-menu="fc" aria-haspopup="menu" aria-expanded="false" title="Elegir color de letra" aria-label="Elegir color de letra"><i class="bi bi-chevron-down"></i></button>
          <div class="cf-rte-menu" role="menu" aria-label="Colores de letra">
            <div class="cf-rte-sws">${sw(COLORES, "fc")}</div>
            <button type="button" role="menuitem" class="cf-rte-item" data-fc="none"><i class="bi bi-arrow-counterclockwise"></i> Automático</button>
          </div>
        </div>
        <div class="cf-rte-split" data-split="ln">
          <button type="button" class="cf-rte-btn" data-menu="ln" aria-haspopup="dialog" aria-expanded="false" title="Insertar enlace" aria-label="Insertar enlace"><i class="bi bi-link-45deg"></i></button>
          <div class="cf-rte-menu cf-rte-link" role="dialog" aria-label="Insertar enlace">
            <label>Dirección del enlace
              <input type="url" inputmode="url" placeholder="https://…" autocomplete="off">
            </label>
            <div class="cf-rte-link-acts">
              <button type="button" class="cf-rte-mini" data-link="quitar">Quitar enlace</button>
              <button type="button" class="cf-rte-mini cf-rte-mini--ok" data-link="aplicar">Aplicar</button>
            </div>
          </div>
        </div>
        <span class="cf-rte-sep" aria-hidden="true"></span>
        <button type="button" class="cf-rte-btn" data-cmd="insertUnorderedList" aria-pressed="false" title="Viñetas" aria-label="Lista con viñetas"><i class="bi bi-list-ul"></i></button>
        <button type="button" class="cf-rte-btn" data-cmd="insertOrderedList" aria-pressed="false" title="Numeración" aria-label="Lista numerada"><i class="bi bi-list-ol"></i></button>
        <div class="cf-rte-split" data-split="al">
          <button type="button" class="cf-rte-btn cf-rte-caret--wide" data-menu="al" aria-haspopup="menu" aria-expanded="false" title="Alineación" aria-label="Alineación del párrafo"><i class="bi bi-text-left" data-al-icon></i><i class="bi bi-chevron-down cf-rte-chev"></i></button>
          <div class="cf-rte-menu" role="menu" aria-label="Alineación">
            ${ALINEAR.map(([c, ic, n]) => `<button type="button" role="menuitemradio" aria-checked="false" class="cf-rte-item" data-cmd="${c}"><i class="bi ${ic}"></i> ${n}</button>`).join("")}
          </div>
        </div>
        <button type="button" class="cf-rte-btn" data-cmd="removeFormat" title="Quitar formato" aria-label="Quitar formato"><i class="bi bi-eraser"></i></button>
      </div>`;
  }

  // ---------- Selección ----------
  function dentro(area) {
    const s = window.getSelection();
    return s.rangeCount && area.contains(s.getRangeAt(0).commonAncestorContainer);
  }
  function guardar(area) {
    const s = window.getSelection();
    area._rango = dentro(area) ? s.getRangeAt(0).cloneRange() : null;
  }
  function restaurar(area) {
    area.focus({ preventScroll: true });
    if (area._rango) {
      const s = window.getSelection(); s.removeAllRanges(); s.addRange(area._rango);
    }
  }
  function ejecutar(area, cmd, valor, css) {
    restaurar(area);
    try { document.execCommand("styleWithCSS", false, !!css); } catch (e) {}
    document.execCommand(cmd, false, valor);
    try { document.execCommand("styleWithCSS", false, false); } catch (e) {}
    guardar(area); estadoBarra(area);
    area.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // ---------- Estado de los botones ----------
  function estadoBarra(area) {
    const bar = area._bar; if (!bar) return;
    const activa = (document.activeElement === area || bar.contains(document.activeElement)) && !!area._rango;
    bar.querySelectorAll("[data-cmd][aria-pressed]").forEach(b => {
      let on = false;
      if (activa) { try { on = document.queryCommandState(b.dataset.cmd); } catch (e) {} }
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    let al = "justifyLeft";
    if (activa) ALINEAR.forEach(([c]) => { try { if (document.queryCommandState(c)) al = c; } catch (e) {} });
    const ic = ALINEAR.find(a => a[0] === al)[1];
    bar.querySelector("[data-al-icon]").className = "bi " + ic;
    bar.querySelectorAll('[data-split="al"] [data-cmd]').forEach(b => b.setAttribute("aria-checked", b.dataset.cmd === al ? "true" : "false"));
  }

  // ---------- Menús desplegables ----------
  function cerrarMenus(excepto) {
    document.querySelectorAll(".cf-rte-split.is-open").forEach(s => {
      if (s === excepto) return;
      s.classList.remove("is-open");
      const c = s.querySelector("[data-menu]"); if (c) c.setAttribute("aria-expanded", "false");
    });
  }
  document.addEventListener("mousedown", e => { if (!e.target.closest(".cf-rte-split")) cerrarMenus(); });

  // El menú se abre hacia donde haya espacio, sin salirse de la pantalla
  function ubicarMenu(menu) {
    const vw = document.documentElement.clientWidth, base = menu.parentElement.getBoundingClientRect();
    menu.style.right = "auto"; menu.style.left = "0";
    const w = menu.getBoundingClientRect().width;
    let izq = 0;
    if (base.left + w > vw - 8) izq = (vw - 8 - w) - base.left;   // correr hacia la izquierda
    if (base.left + izq < 8) izq = 8 - base.left;                  // sin salirse por la izquierda
    menu.style.left = izq + "px";
  }

  function vacio(area) {
    const v = texto(area) === "" && !area.querySelector("li");
    area.classList.toggle("is-empty", v);
    if (v && area.innerHTML !== "" && !area.contains(document.activeElement) && document.activeElement !== area) area.innerHTML = "";
  }

  function init(area) {
    if (area._bar) return;
    const etiqueta = (document.getElementById(area.getAttribute("aria-labelledby")) || {}).textContent || "";
    const wrap = document.createElement("div");
    wrap.className = "cf-rte";
    area.parentNode.insertBefore(wrap, area);
    wrap.innerHTML = barraHTML(area.id, etiqueta.trim());
    wrap.appendChild(area);
    const bar = wrap.querySelector(".cf-rte-bar");
    area._bar = bar;
    area._hl = "#fff176"; area._fc = "#c62828";
    try { document.execCommand("defaultParagraphSeparator", false, "div"); } catch (e) {}

    // Los botones no le quitan el foco al texto (así no se pierde la selección)
    bar.addEventListener("mousedown", e => {
      if (e.target.closest("input, label")) return;
      if (e.target.closest("button")) e.preventDefault();
    });

    bar.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      const split = b.closest(".cf-rte-split");
      if (b.dataset.menu) {                                   // abrir / cerrar menú
        const abrir = !split.classList.contains("is-open");
        cerrarMenus(split);
        split.classList.toggle("is-open", abrir);
        b.setAttribute("aria-expanded", abrir ? "true" : "false");
        if (abrir) {
          guardar(area);
          ubicarMenu(split.querySelector(".cf-rte-menu"));
          if (b.dataset.menu === "ln") {
            const a = area._rango && (area._rango.startContainer.parentElement || {}).closest && area._rango.startContainer.parentElement.closest("a");
            const inp = split.querySelector("input"); inp.value = a ? a.getAttribute("href") : "";
            setTimeout(() => inp.focus(), 0);
          } else {
            const primero = split.querySelector(".cf-rte-menu button"); if (primero && e.detail === 0) primero.focus();
          }
        }
        return;
      }
      if (b.dataset.cmd) {
        ejecutar(area, b.dataset.cmd);
        if (b.dataset.cmd === "removeFormat") {               // también quita resaltado y enlaces
          ejecutar(area, "hiliteColor", "transparent", true);
          ejecutar(area, "unlink");
        }
        cerrarMenus(); return;
      }
      if (b.dataset.apply === "hl") { ejecutar(area, "hiliteColor", area._hl, true); return; }
      if (b.dataset.apply === "fc") { ejecutar(area, "foreColor", area._fc, true); return; }
      if (b.dataset.hl) {
        if (b.dataset.hl === "none") ejecutar(area, "hiliteColor", "transparent", true);
        else { area._hl = b.dataset.hl; split.querySelector(".cf-rte-line").style.setProperty("--sw", b.dataset.hl); ejecutar(area, "hiliteColor", b.dataset.hl, true); }
        cerrarMenus(); split.querySelector("[data-apply]").focus({ preventScroll: true }); area.focus({ preventScroll: true }); restaurar(area); return;
      }
      if (b.dataset.fc) {
        if (b.dataset.fc === "none") ejecutar(area, "foreColor", "inherit", true), quitarColor(area);
        else { area._fc = b.dataset.fc; split.querySelector(".cf-rte-line").style.setProperty("--sw", b.dataset.fc); ejecutar(area, "foreColor", b.dataset.fc, true); }
        cerrarMenus(); restaurar(area); return;
      }
      if (b.dataset.link) aplicarEnlace(area, split, b.dataset.link);
    });

    // Enlace: Enter aplica, Escape cierra
    bar.querySelector(".cf-rte-link input").addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); aplicarEnlace(area, e.target.closest(".cf-rte-split"), "aplicar"); }
    });

    // Teclado en la barra: flechas entre botones (patrón toolbar), Escape cierra menús
    const botones = () => [...bar.querySelectorAll(":scope > button, :scope > .cf-rte-split > button")];
    botones().forEach((b, i) => b.tabIndex = i === 0 ? 0 : -1);
    bar.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        const abierto = bar.querySelector(".cf-rte-split.is-open");
        if (abierto) { e.preventDefault(); cerrarMenus(); abierto.querySelector("[data-menu]").focus(); }
        return;
      }
      if (e.target.closest(".cf-rte-menu")) {
        if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "ArrowRight" || e.key === "ArrowLeft") {
          const items = [...e.target.closest(".cf-rte-menu").querySelectorAll("button")];
          const i = items.indexOf(e.target); if (i < 0) return;
          e.preventDefault();
          const d = (e.key === "ArrowDown" || e.key === "ArrowRight") ? 1 : -1;
          items[(i + d + items.length) % items.length].focus();
        }
        return;
      }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
      const lista = botones(), i = lista.indexOf(e.target); if (i < 0) return;
      e.preventDefault();
      const j = e.key === "Home" ? 0 : e.key === "End" ? lista.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + lista.length) % lista.length;
      lista.forEach(b => b.tabIndex = -1); lista[j].tabIndex = 0; lista[j].focus();
    });

    // Pegar: solo texto (evita estilos raros traídos de otros programas)
    area.addEventListener("paste", e => {
      e.preventDefault();
      const t = (e.clipboardData || window.clipboardData).getData("text/plain");
      document.execCommand("insertText", false, t);
    });
    area.addEventListener("drop", e => e.preventDefault());
    area.addEventListener("keyup", () => { guardar(area); estadoBarra(area); });
    area.addEventListener("mouseup", () => { guardar(area); estadoBarra(area); });
    area.addEventListener("input", () => { vacio(area); estadoBarra(area); });
    area.addEventListener("focus", () => { area.classList.remove("is-empty"); wrap.classList.add("is-focus"); });
    area.addEventListener("blur", () => { guardar(area); vacio(area); wrap.classList.remove("is-focus"); setTimeout(() => estadoBarra(area), 0); });
    document.addEventListener("selectionchange", () => { if (dentro(area)) guardar(area); estadoBarra(area); });
    vacio(area);
  }

  function quitarColor(area) {
    // "Automático": se quita el color de letra de los fragmentos seleccionados
    const r = area._rango; if (!r) return;
    area.querySelectorAll("[style*='color'], font[color]").forEach(el => {
      if (!r.intersectsNode(el)) return;
      if (el.tagName === "FONT") el.removeAttribute("color");
      el.style.removeProperty("color");
    });
  }

  function aplicarEnlace(area, split, accion) {
    const inp = split.querySelector("input");
    cerrarMenus();
    if (accion === "quitar") { ejecutar(area, "unlink"); return; }
    let url = inp.value.trim();
    if (!url) { restaurar(area); return; }
    if (!/^(https?:|mailto:)/i.test(url)) url = (url.includes("@") && !url.includes("/") ? "mailto:" : "https://") + url;
    restaurar(area);
    const s = window.getSelection();
    if (s.isCollapsed) document.execCommand("insertText", false, url.replace(/^mailto:/i, ""));
    if (s.isCollapsed) {           // seleccionar lo que se acaba de escribir para convertirlo en enlace
      const n = s.anchorNode, fin = s.anchorOffset, len = url.replace(/^mailto:/i, "").length;
      const r = document.createRange(); r.setStart(n, Math.max(0, fin - len)); r.setEnd(n, fin);
      s.removeAllRanges(); s.addRange(r);
    }
    guardar(area);
    ejecutar(area, "createLink", url);
  }

  // ---------- Lectura del contenido ----------
  function texto(area) { return (area.innerText || area.textContent || "").replace(/\u00a0/g, " ").trim(); }

  const NOMBRES = { black: "#000000", white: "#ffffff", red: "#ff0000", blue: "#0000ff", green: "#008000", yellow: "#ffff00" };
  function color(v) {
    if (!v) return null;
    v = String(v).trim().toLowerCase();
    if (v === "transparent" || v === "inherit" || v === "initial" || v === "currentcolor") return null;
    if (NOMBRES[v]) v = NOMBRES[v];
    let m = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
    if (m) {
      let h = m[1]; if (h.length === 3) h = h.split("").map(c => c + c).join("");
      return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16));
    }
    m = v.match(/^rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)(?:[ ,/]+([\d.]+))?/);
    if (m) { if (m[4] !== undefined && Number(m[4]) === 0) return null; return [m[1], m[2], m[3]].map(Number); }
    return null;
  }
  const urlSegura = u => /^(https?:|mailto:)/i.test((u || "").trim()) ? u.trim() : null;
  const BLOQUES = /^(DIV|P|LI|UL|OL|H[1-6]|BLOCKQUOTE|PRE)$/;

  // Convierte el contenido en bloques: [{ align, list, num, level, runs: [{text,b,i,u,color,bg,href} | {br:true}] }]
  function modelo(area) {
    const bloques = [];
    let actual = null;
    function nuevo(props) { actual = Object.assign({ align: "left", list: null, num: 0, level: 0, runs: [] }, props); bloques.push(actual); }
    function alinear(el, heredado) {
      const a = (el.style && el.style.textAlign) || el.getAttribute && el.getAttribute("align") || "";
      return /^(left|center|right|justify)$/.test(a) ? a : (a === "start" ? "left" : a === "end" ? "right" : heredado);
    }
    function recorrer(nodo, est, ctx) {
      if (nodo.nodeType === 3) {
        const t = nodo.nodeValue.replace(/[\r\n\t]+/g, " ").replace(/\u00a0/g, " ");
        if (!t) return;
        if (!actual) nuevo({ align: ctx.align, list: ctx.list, num: ctx.num, level: ctx.level });
        actual.runs.push(Object.assign({ text: t }, est));
        return;
      }
      if (nodo.nodeType !== 1) return;
      const el = nodo, tag = el.tagName;
      if (tag === "BR") {
        if (!actual) nuevo({ align: ctx.align, list: ctx.list, num: ctx.num, level: ctx.level });
        actual.runs.push({ br: true });
        return;
      }
      if (/^(SCRIPT|STYLE|IMG|IFRAME|OBJECT|SVG)$/.test(tag)) return;
      const e = Object.assign({}, est);
      const st = el.style || {};
      if (tag === "B" || tag === "STRONG" || /^(bold|[6-9]00)$/.test(st.fontWeight || "")) e.b = true;
      if (st.fontWeight === "normal" || st.fontWeight === "400") e.b = false;
      if (tag === "I" || tag === "EM" || st.fontStyle === "italic") e.i = true;
      if (st.fontStyle === "normal") e.i = false;
      if (tag === "U" || /underline/.test(st.textDecoration || st.textDecorationLine || "")) e.u = true;
      const c = color(st.color || (tag === "FONT" && el.getAttribute("color"))); if (c) e.color = c;
      const bg = color(st.backgroundColor); if (bg) e.bg = bg;
      if (tag === "A") { const h = urlSegura(el.getAttribute("href")); if (h) e.href = h; }

      let c2 = Object.assign({}, ctx);
      if (tag === "UL" || tag === "OL") {
        c2.list = tag === "UL" ? "ul" : "ol"; c2.level = ctx.level + 1; c2.contador = { n: 0 };
        c2.align = alinear(el, ctx.align);
        actual = null;
        [...el.childNodes].forEach(h => recorrer(h, e, c2));
        actual = null;
        return;
      }
      if (BLOQUES.test(tag)) {
        c2.align = alinear(el, ctx.align);
        if (tag === "LI") { c2.num = ++ctx.contador.n; nuevo({ align: c2.align, list: ctx.list, num: c2.num, level: ctx.level }); }
        else {
          // un div que solo envuelve otros bloques no crea un párrafo vacío
          actual = null;
          c2.list = null; c2.level = 0;
          if (ctx.list) { c2.list = ctx.list; c2.level = ctx.level; c2.num = ctx.num; }
        }
        [...el.childNodes].forEach(h => recorrer(h, e, Object.assign({}, c2, { list: tag === "LI" ? null : c2.list })));
        // "<div><br></div>" es una línea vacía: se deja un solo salto
        if (actual && actual.runs.length > 1 && actual.runs[actual.runs.length - 1].br) actual.runs.pop();
        if (tag === "LI" && actual) actual.align = c2.align;
        actual = null;
        return;
      }
      [...el.childNodes].forEach(h => recorrer(h, e, ctx));
    }
    recorrer(area, {}, { align: "left", list: null, num: 0, level: 0 });
    // quitar bloques finales vacíos
    while (bloques.length && bloques[bloques.length - 1].runs.every(r => r.br || !r.text.trim()) && !bloques[bloques.length - 1].list) bloques.pop();
    bloques.forEach(b => {
      // quitar <br> sobrante al final de cada bloque (contenteditable lo agrega)
      while (b.runs.length > 1 && b.runs[b.runs.length - 1].br) b.runs.pop();
      if (b.runs.length === 1 && b.runs[0].br) b.runs = [];
    });
    return bloques;
  }

  // ---------- HTML limpio para mostrar el mapa ----------
  const rgb = c => `rgb(${c.join(",")})`;
  function runHTML(r) {
    if (r.br) return "<br>";
    let h = esc(r.text).replace(/ {2}/g, " &nbsp;");
    const st = [];
    if (r.color) st.push("color:" + rgb(r.color));
    if (r.bg) st.push("background-color:" + rgb(r.bg));
    if (st.length) h = `<span style="${st.join(";")}">${h}</span>`;
    if (r.u) h = `<u>${h}</u>`;
    if (r.i) h = `<em>${h}</em>`;
    if (r.b) h = `<strong>${h}</strong>`;
    if (r.href) h = `<a href="${esc(r.href)}" target="_blank" rel="noopener noreferrer">${h}</a>`;
    return h;
  }
  function html(bloques) {
    let out = "", abierta = null;
    bloques.forEach(b => {
      const tipo = b.list ? b.list + b.level : null;
      if (abierta && abierta !== tipo) { out += `</${abierta.slice(0, 2)}>`; abierta = null; }
      const al = b.align && b.align !== "left" ? ` style="text-align:${b.align}"` : "";
      const contenido = b.runs.map(runHTML).join("") || "<br>";
      if (b.list) {
        if (!abierta) { out += `<${b.list} class="cf-rich-l${Math.min(b.level, 3)}">`; abierta = tipo; }
        out += `<li${al}>${contenido}</li>`;
      } else out += `<p${al}>${contenido}</p>`;
    });
    if (abierta) out += `</${abierta.slice(0, 2)}>`;
    return out;
  }

  window.CFEditor = { init, texto, modelo, html, color };
})();
