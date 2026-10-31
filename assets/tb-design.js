/* Tailorbird "Design your own" builder.
   Reads the choices in the form, draws a preview, keeps the summary and price up to date,
   and adds the bracelet to the bag with its choices as line item properties. */
(function () {
  'use strict';

  var NEUTRAL = ['#D8C3A0', '#B9A88C', '#E8DCC8'];

  function money(pence, format) {
    var v = (pence / 100);
    var withDec = v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var noDec = Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (format || '£{{amount}}')
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/, noDec)
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, v.toFixed(2).replace('.', ','))
      .replace(/\{\{\s*amount\s*\}\}/, withDec)
      .replace(/<[^>]*>/g, '');
  }

  function el(name, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  /* Draws the bracelet as a ring seen from above. */
  function draw(svg, style, colours, charm) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var cx = 150, cy = 150, R = 100;
    var pal = colours.length ? colours : NEUTRAL;
    var cord = '#6B635B';
    function at(r, a) { return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
    function bead(x, y, r, c) {
      svg.appendChild(el('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: r, fill: c, stroke: 'rgba(59,47,39,.35)', 'stroke-width': 1 }));
      svg.appendChild(el('circle', { cx: (x - r * 0.35).toFixed(1), cy: (y - r * 0.35).toFixed(1), r: (r * 0.28).toFixed(1), fill: 'rgba(255,255,255,.45)' }));
    }
    var start = -Math.PI / 2, i, a, p, n;
    if (style === 'meadow') {
      svg.appendChild(el('circle', { cx: cx, cy: cy, r: R, fill: 'none', stroke: cord, 'stroke-width': 1.5 }));
      n = 8;
      for (i = 0; i < n; i++) {
        var mid = start + (i + 0.5) * (2 * Math.PI / n);
        for (var j = -1; j <= 1; j++) { p = at(R, mid + j * 0.085); bead(p[0], p[1], 7.5, pal[(i + j + 1) % pal.length]); }
      }
    } else if (style === 'dales') {
      n = 40;
      var pts = [];
      for (i = 0; i < n; i++) { a = start + i * (2 * Math.PI / n); pts.push(at(i % 2 ? R - 12 : R + 12, a)); }
      svg.appendChild(el('polygon', { points: pts.map(function (q) { return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '), fill: 'none', stroke: cord, 'stroke-width': 1.2 }));
      pts.forEach(function (q, k) { if (k) bead(q[0], q[1], 7, pal[Math.floor(k / 2) % pal.length]); });
    } else if (style === 'hedgerow') {
      [R + 9, R - 9].forEach(function (rr, ring) {
        svg.appendChild(el('circle', { cx: cx, cy: cy, r: rr, fill: 'none', stroke: cord, 'stroke-width': 1.2 }));
        var m = ring ? 26 : 30;
        for (var k = 1; k < m; k++) { var q = at(rr, start + (k + ring * 0.5) * (2 * Math.PI / m)); bead(q[0], q[1], 6.5, pal[(k + ring) % pal.length]); }
      });
    } else {
      svg.appendChild(el('circle', { cx: cx, cy: cy, r: R, fill: 'none', stroke: cord, 'stroke-width': 1.2 }));
      n = 30;
      for (i = 1; i < n; i++) { p = at(R, start + i * (2 * Math.PI / n)); bead(p[0], p[1], 9, pal[i % pal.length]); }
    }
    // Clasp at the top.
    svg.appendChild(el('rect', { x: cx - 9, y: cy - R - 6, width: 18, height: 12, rx: 3, fill: '#C9A15A', stroke: '#8C6B2F', 'stroke-width': 1 }));
    // Charm at the bottom.
    if (charm) {
      var by = cy + R + (style === 'hedgerow' ? 9 : 0);
      svg.appendChild(el('line', { x1: cx, y1: by, x2: cx, y2: by + 12, stroke: '#8C6B2F', 'stroke-width': 1.5 }));
      var isStone = /birth/i.test(charm);
      svg.appendChild(el('circle', { cx: cx, cy: by + 22, r: 10, fill: isStone ? pal[0] : '#C9A15A', stroke: '#8C6B2F', 'stroke-width': 1.2 }));
      if (!isStone) svg.appendChild(el('text', { x: cx, y: by + 26, 'text-anchor': 'middle', 'font-size': 11, 'font-family': 'serif', fill: '#3B2F27' })).textContent = charm.charAt(0);
    }
  }

  function init(root) {
    if (root.dataset.ready) return;
    root.dataset.ready = '1';
    var C = JSON.parse(root.querySelector('[data-config]').textContent);
    var form = root.querySelector('[data-form]');
    var svg = root.querySelector('[data-preview-svg]');
    var out = function (k) { return root.querySelector('[data-out="' + k + '"]'); };
    var err = root.querySelector('[data-error]');
    var colourMsg = root.querySelector('[data-colour-msg]');
    var picked = []; // colours in the order they were picked

    function styleInput() { return form.querySelector('input[name="style"]:checked'); }
    function charmName() { var c = form.querySelector('input[name="charm"]:checked'); return c ? c.value : ''; }
    function charm() { var n = charmName(); return C.charms.find(function (c) { return c.name === n; }) || null; }
    function variant() {
      if (!C.product) return null;
      var st = styleInput(); var name = st ? st.value.toLowerCase() : '';
      return C.product.variants.find(function (v) { return v.title.toLowerCase() === name; }) || C.product.variants[0];
    }
    function total() {
      var v = variant(); var ch = charm();
      return (v ? v.price : C.fallbackPrice) + (ch ? ch.price : 0);
    }

    function render() {
      var st = styleInput();
      var hexes = picked.map(function (n) { var i = form.querySelector('input[name="colour"][value="' + CSS.escape(n) + '"]'); return i && i.dataset.hex; }).filter(Boolean);
      draw(svg, st ? st.dataset.preview : 'beck', hexes, charmName());
      out('style').textContent = st ? st.value : 'Choose a style';
      out('colours').textContent = picked.length ? picked.join(', ') : 'Choose up to ' + C.maxColours;
      out('charm').textContent = charmName() || 'No charm';
      out('size').textContent = form.elements.size ? form.elements.size.value : '';
      out('total').textContent = money(total(), C.moneyFormat);
      form.querySelectorAll('input[name="colour"]').forEach(function (i) {
        i.disabled = !i.checked && picked.length >= C.maxColours;
        i.closest('.tb-swatch').classList.toggle('is-picked', i.checked);
      });
      colourMsg.textContent = picked.length >= C.maxColours ? 'That\'s ' + C.maxColours + '. Untick one to swap it.' : '';
    }

    form.addEventListener('change', function (e) {
      if (e.target.name === 'colour') {
        var v = e.target.value;
        if (e.target.checked) { if (picked.indexOf(v) < 0) picked.push(v); }
        else picked = picked.filter(function (x) { return x !== v; });
      }
      err.textContent = '';
      render();
    });

    root.querySelector('[data-add]').addEventListener('click', function () {
      err.textContent = '';
      var v = variant(); var ch = charm(); var st = styleInput();
      if (!v) { err.textContent = 'This bracelet can\'t be added yet: the shop still needs to link the Design your own product in the theme editor.'; return; }
      if (!picked.length) { err.textContent = 'Pick at least one colour first.'; return; }
      if (ch && ch.price > 0 && !ch.variantId) { err.textContent = 'The ' + ch.name + ' charm can\'t be added yet: the shop still needs to link its product in the theme editor.'; return; }
      var id = 'TB' + Date.now().toString(36).toUpperCase();
      var props = { 'Style': st ? st.value : '', 'Colours': picked.join(', '), 'Charm': charmName() || 'No charm', 'Size': form.elements.size.value, '_Bracelet ID': id };
      if (form.elements['for'].value.trim()) props['Who it\'s for'] = form.elements['for'].value.trim();
      if (form.elements.note.value.trim()) props['Note'] = form.elements.note.value.trim();
      var items = [{ id: v.id, quantity: 1, properties: props }];
      if (ch && ch.variantId) items.push({ id: ch.variantId, quantity: 1, properties: { 'For bracelet': id, '_Bracelet ID': id } });
      var btn = this; btn.disabled = true; btn.setAttribute('aria-busy', 'true');
      fetch(C.cartAddUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items: items }) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.description || j.message || 'Could not add to the bag'); return j; }); })
        .then(function () { window.location.href = C.cartUrl; })
        .catch(function (e) { err.textContent = e.message + '. Please try again.'; btn.disabled = false; btn.removeAttribute('aria-busy'); });
    });

    // Arriving from a collection's "Design your own" link: ?style=Beck&colours=Sea glass,Amber
    var q = new URLSearchParams(window.location.search);
    if (q.get('style')) {
      var want = q.get('style').toLowerCase();
      form.querySelectorAll('input[name="style"]').forEach(function (i) { if (i.value.toLowerCase() === want) i.checked = true; });
    }
    if (q.get('colours')) {
      q.get('colours').split(',').forEach(function (n) {
        n = n.trim().toLowerCase();
        form.querySelectorAll('input[name="colour"]').forEach(function (i) {
          if (i.value.toLowerCase() === n && picked.length < C.maxColours && !i.checked) { i.checked = true; picked.push(i.value); }
        });
      });
    }
    render();
  }

  function boot() { document.querySelectorAll('[data-tb-design]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  document.addEventListener('shopify:section:load', boot);
})();
