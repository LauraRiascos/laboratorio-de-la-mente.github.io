/**
* Template Name: BizLand
* Template URL: https://bootstrapmade.com/bizland-bootstrap-business-template/
* Updated: Aug 07 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body and show the scroll-top button as the page is scrolled down.
   * Un solo listener pasivo, agrupado por cuadro de animación, para no recalcular en cada evento.
   */
  const body = document.body;
  const scrollTop = document.querySelector('.scroll-top');
  let ticking = false;

  function onScroll() {
    const abajo = window.scrollY > 100;
    body.classList.toggle('scrolled', abajo);
    if (scrollTop) scrollTop.classList.toggle('active', abajo);
    ticking = false;
  }

  document.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('load', onScroll);

  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    body.classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
    document.querySelectorAll('#navmenu a').forEach(navmenu => {
      navmenu.addEventListener('click', () => {
        if (document.querySelector('.mobile-nav-active')) mobileNavToogle();
      });
    });
  }

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Animaciones al hacer scroll ([data-sr] = fade-up, "left", "zoom").
   * Usa IntersectionObserver (no escucha el scroll) y solo anima opacity/transform,
   * así el navegador lo resuelve en la GPU. Cada elemento se anima una sola vez.
   * Los elementos de pantallas ocultas se animan cuando su pantalla se muestra.
   */
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revelables = document.querySelectorAll('[data-sr]');

  if (!reduceMotion && 'IntersectionObserver' in window && revelables.length) {
    document.documentElement.classList.add('sr-on');
    const observer = new IntersectionObserver((entries) => {
      let i = 0;
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // pequeño escalonado entre los elementos que entran a la vez
        el.style.setProperty('--sr-delay', Math.min(i++ * 90, 360) + 'ms');
        el.classList.add('is-in');
        observer.unobserve(el);
      });
    }, { threshold: 0.1 });
    revelables.forEach(el => observer.observe(el));
  }

})();

// Menú con tabs
document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".tab-link");
  const contents = document.querySelectorAll(".tab-content");

  contents.forEach(content => content.classList.remove("active"));
  document.getElementById("seccion2").classList.add("active");

  function setActiveTab(target) {
    tabs.forEach(tab => tab.classList.remove("active"));
    document.querySelector(`[data-tab="${target}"]`).classList.add("active");
  }

  setActiveTab("seccion2");

  tabs.forEach(tab => {
    tab.addEventListener("click", function (event) {
      event.preventDefault();
      const target = this.getAttribute("data-tab");

      // Desactivar todas las secciones
      contents.forEach(content => content.classList.remove("active"));

      // Activar la sección seleccionada
      document.getElementById(target).classList.add("active");

      // Marcar como tab activo
      setActiveTab(target);

      // Scrollear hacia arriba después del cambio
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      }, 50);
    });
  });
});
