/* Bestseller banner: draws each slide's bead ring, rotates slides, and hands "Customise" patterns to the builder. */
(function () {
  function ring(colours) {
    var n = 24, cx = 200, cy = 200, R = 172, gap = 0.16, step = (2 * Math.PI - gap) / n, start = -Math.PI / 2 + gap / 2 + step / 2;
    var w = Math.min(R * step * 0.86, 28), h = 30, seed = colours.length * 31 + 7, out = '';
    out += '<circle cx="200" cy="200" r="172" fill="none" stroke="#8c7a63" stroke-width="2.5"/>';
    for (var i = 0; i < n; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      var c = colours[Math.floor(seed / 233280 * colours.length)];
      var a = start + i * step, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), deg = a * 180 / Math.PI + 90;
      out += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + deg.toFixed(1) + ')"><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="' + (w * 0.32) + '" fill="' + c + '" stroke="rgba(0,0,0,.22)"/></g>';
    }
    out += '<g transform="translate(200 28)" stroke="#b29a5b"><ellipse cx="-10" cy="0" rx="12" ry="8" fill="none" stroke-width="4"/><circle cx="13" cy="0" r="6" fill="none" stroke-width="3.5"/></g>';
    return out;
  }

  function init(root) {
    if (root.dataset.ready) return;
    root.dataset.ready = 'true';
    root.querySelectorAll('svg[data-colours]').forEach(function (svg) {
      var cols = svg.dataset.colours.split(',').filter(function (c) { return /^#[0-9a-f]{3,8}$/i.test(c); });
      if (cols.length) svg.innerHTML = ring(cols);
    });
    root.querySelectorAll('[data-pattern]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.dispatchEvent(new CustomEvent('bracelet:load-pattern', { detail: { pattern: btn.dataset.pattern.split(','), name: btn.dataset.name } }));
        var target = document.getElementById('design');
        if (target && !document.querySelector('[data-bead-builder]')) target.scrollIntoView();
      });
    });

    var slides = root.querySelectorAll('.bbn-slide'), dots = root.querySelectorAll('.bbn-dot'), pauseBtn = root.querySelector('[data-pause]');
    if (slides.length < 2) return;
    var secs = parseInt(root.dataset.interval, 10) || 6, cur = 0, timer = null, paused = false;
    root.style.setProperty('--bbn-interval', secs + 's');
    function go(i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, j) { s.classList.toggle('is-active', j === cur); });
      dots.forEach(function (d, j) { d.classList.remove('is-active'); void d.offsetWidth; d.classList.toggle('is-active', j === cur); });
    }
    function restart() { clearInterval(timer); if (!paused) timer = setInterval(function () { go(cur + 1); }, secs * 1000); }
    function setPaused(p) { paused = p; root.classList.toggle('is-paused', p); pauseBtn.textContent = p ? 'Play' : 'Pause'; restart(); }
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); restart(); }); });
    pauseBtn.addEventListener('click', function () { setPaused(!paused); });
    root.addEventListener('mouseenter', function () { if (!paused) { clearInterval(timer); root.classList.add('is-paused'); } });
    root.addEventListener('mouseleave', function () { if (!paused) { root.classList.remove('is-paused'); go(cur); restart(); } });
    root.addEventListener('focusin', function () { if (!paused) clearInterval(timer); });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.Shopify && Shopify.designMode) setPaused(true); else restart();
    document.addEventListener('shopify:block:select', function (e) {
      var i = Array.prototype.indexOf.call(slides, e.target);
      if (i >= 0) { go(i); setPaused(true); }
    });
  }

  function boot() { document.querySelectorAll('[data-bracelet-banner]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  document.addEventListener('shopify:section:load', boot);
})();
