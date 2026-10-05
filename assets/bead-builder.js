/* Bracelet builder: pick a size, add beads, see a live preview, and add the design to the Shopify cart.
   The cart gets one "cord and clasp" line plus one line per bead colourway, all tagged with the same _Bracelet ID
   so the order shows which beads belong to which bracelet. */
(function () {
  function parseSizes(text) {
    return String(text || '')
      .split(/\r?\n/)
      .map(function (line) { return line.split('|').map(function (c) { return c.trim(); }); })
      .filter(function (c) { return c.length >= 3 && !isNaN(parseFloat(c[1])) && !isNaN(parseFloat(c[2])); })
      .map(function (c) { return { inch: c[0], cm: [parseFloat(c[1]), parseFloat(c[2])], women: c[3] || '', men: c[4] || '' }; });
  }

  function init(root) {
    if (root.dataset.ready) return;
    root.dataset.ready = 'true';
    var C = JSON.parse(root.querySelector('[data-config]').textContent);
    var sizes = parseSizes(C.sizeChart);
    var products = C.products.filter(function (p) { return p.colours && p.colours.length && p.colours[0]; });
    if (!sizes.length || !products.length) return;
    var byId = {};
    products.forEach(function (p) { p.price = Number(p.price) || 0; byId[p.id] = p; });
    var basePrice = Number(C.base.price) || 0;
    var $ = function (sel) { return root.querySelector(sel); };
    var fmt = new Intl.NumberFormat(C.locale || 'en-GB', { style: 'currency', currency: C.currency || 'GBP' });
    var money = function (n) { return fmt.format(n); };
    var esc = function (s) { var d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; };

    var maxBeads = function (s) { return Math.floor((s.cm[1] - C.claspAllowanceCm) / C.beadLengthCm + 1e-9); };
    var seed = 7;
    var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var newBead = function (pid) { return { pid: pid, shade: Math.floor(rnd() * byId[pid].colours.length) }; };
    var priceOf = function (beads) { return basePrice + beads.reduce(function (t, b) { return t + byId[b.pid].price; }, 0); };

    var defaultIdx = Math.min(2, sizes.length - 1);
    var state = { fit: sizes[defaultIdx].women ? 'women' : 'men', sizeIdx: defaultIdx, beads: [], label: 'sample' };
    var size = function () { return sizes[state.sizeIdx]; };
    var cap = function () { return maxBeads(size()); };
    var fitName = function () { return state.fit === 'women' ? "Women's" : "Men's"; };
    var touched = function () { state.label = null; };

    (function sample() {
      var pattern = [products[0].id, products[0].id];
      if (products[2]) pattern.push(products[2].id, products[2].id, products[2].id);
      for (var i = 0; i < cap(); i++) state.beads.push(newBead(pattern[i % pattern.length]));
    })();

    function ringSVG(beads, slots) {
      var cx = 200, cy = 210, R = 150;
      var totalLen = slots * C.beadLengthCm + C.claspAllowanceCm;
      var claspArc = C.claspAllowanceCm / totalLen * 2 * Math.PI;
      var step = (2 * Math.PI - claspArc) / slots, start = -Math.PI / 2 + claspArc / 2 + step / 2;
      var w = Math.min(R * step * 0.86, 28), h = 34;
      var out = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" class="bb-cord" stroke-width="2.5"/>';
      for (var i = 0; i < slots; i++) {
        var a = start + i * step, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), deg = a * 180 / Math.PI + 90, b = beads[i];
        if (b) {
          out += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + deg.toFixed(1) + ')">' +
            '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="' + (w * 0.32) + '" fill="' + esc(byId[b.pid].colours[b.shade]) + '" stroke="rgba(0,0,0,.22)"/>' +
            '<rect x="' + (-w / 2 + 2) + '" y="' + (-h / 2 + 3) + '" width="' + Math.max(w * 0.22, 2) + '" height="' + (h - 6) + '" rx="1.5" fill="rgba(255,255,255,.28)"/></g>';
        } else {
          out += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="4" class="bb-slot"/>';
        }
      }
      out += '<g transform="translate(' + cx + ' ' + (cy - R) + ')" class="bb-clasp"><ellipse cx="-10" cy="0" rx="12" ry="8" fill="none" stroke-width="4"/><circle cx="13" cy="0" r="6" fill="none" stroke-width="3.5"/></g>';
      var s = size();
      out += '<text x="200" y="206" text-anchor="middle" class="bb-ring-title">' + esc(s[state.fit]) + '</text>' +
        '<text x="200" y="230" text-anchor="middle" class="bb-ring-sub">' + fitName() + ' · ' + s.cm[0].toFixed(1) + '–' + s.cm[1].toFixed(1) + ' cm</text>';
      return out;
    }

    function renderSizes() {
      root.querySelectorAll('[data-fit]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.fit === state.fit)); });
      var wrap = $('[data-sizes]'); wrap.innerHTML = '';
      sizes.forEach(function (s, i) {
        var label = s[state.fit]; if (!label) return;
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'bb-size';
        b.setAttribute('aria-pressed', String(i === state.sizeIdx));
        b.innerHTML = '<b>' + esc(label) + '</b><span>' + s.cm[0].toFixed(1) + '–' + s.cm[1].toFixed(1) + ' cm</span><span>Up to ' + maxBeads(s) + ' beads</span>';
        b.addEventListener('click', function () { pickSize(i); });
        wrap.appendChild(b);
      });
    }
    function pickSize(i) {
      state.sizeIdx = i;
      if (state.beads.length > cap()) state.beads.length = cap();
      render();
    }
    function setFit(fit) {
      state.fit = fit;
      if (!size()[fit]) {
        var opts = sizes.map(function (s, i) { return s[fit] ? i : -1; }).filter(function (i) { return i >= 0; });
        if (!opts.length) return;
        pickSize(opts.reduce(function (a, b) { return Math.abs(b - state.sizeIdx) < Math.abs(a - state.sizeIdx) ? b : a; }));
        return;
      }
      render();
    }
    root.querySelectorAll('[data-fit]').forEach(function (b) { b.addEventListener('click', function () { setFit(b.dataset.fit); }); });

    function renderProducts() {
      var wrap = $('[data-products]'); wrap.innerHTML = '';
      var full = state.beads.length >= cap();
      products.forEach(function (p) {
        var n = state.beads.filter(function (b) { return b.pid === p.id; }).length;
        var off = full || !p.available;
        var row = document.createElement('div'); row.className = 'bb-prod';
        row.innerHTML =
          (p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + ' beads" width="64" height="64" loading="lazy">' : '<span class="bb-prod-img"></span>') +
          '<div class="bb-prod-info"><div class="bb-prod-name">' + esc(p.name) + '</div>' +
          '<div class="bb-prod-meta"><span class="bb-swatches">' + p.colours.map(function (c) { return '<i style="background:' + esc(c) + '"></i>'; }).join('') + '</span><span>' + esc(p.subtitle) + '</span></div>' +
          '<div class="bb-prod-meta"><span>' + (p.available ? money(p.price) + ' per bead' : 'Out of stock') + '</span></div></div>' +
          '<div class="bb-prod-actions"><button type="button" class="bb-btn bb-btn--small bb-btn--primary" data-a="add"' + (off ? ' disabled' : '') + '>Add bead</button>' +
          '<button type="button" class="bb-btn bb-btn--small" data-a="fill"' + (off ? ' disabled' : '') + '>Fill rest</button>' +
          '<div class="bb-count">' + n + ' in design</div></div>';
        row.querySelector('[data-a="add"]').addEventListener('click', function () { if (state.beads.length < cap()) { state.beads.push(newBead(p.id)); touched(); render(); } });
        row.querySelector('[data-a="fill"]').addEventListener('click', function () { while (state.beads.length < cap()) state.beads.push(newBead(p.id)); touched(); render(); });
        wrap.appendChild(row);
      });
    }
    function renderSeq() {
      var wrap = $('[data-seq]'); wrap.innerHTML = '';
      if (!state.beads.length) { wrap.innerHTML = '<span class="bb-note bb-seq-empty">No beads yet. Add some from the list above.</span>'; return; }
      state.beads.forEach(function (b, i) {
        var p = byId[b.pid], btn = document.createElement('button');
        btn.type = 'button'; btn.style.background = p.colours[b.shade];
        btn.title = 'Bead ' + (i + 1) + ': ' + p.name + '. Tap to remove.'; btn.setAttribute('aria-label', btn.title);
        btn.addEventListener('click', function () { state.beads.splice(i, 1); touched(); render(); });
        wrap.appendChild(btn);
      });
    }
    function counts() {
      var c = {};
      state.beads.forEach(function (b) { c[b.pid] = (c[b.pid] || 0) + 1; });
      return c;
    }
    function renderSummary() {
      var s = size(), n = state.beads.length, c = cap(), k = counts();
      var rows = '<div class="bb-row"><span>Size</span><span>' + fitName() + ' ' + esc(s[state.fit]) + '</span></div>';
      products.forEach(function (p) { if (k[p.id]) rows += '<div class="bb-row"><span>' + esc(p.name) + ' × ' + k[p.id] + '</span><span>' + money(k[p.id] * p.price) + '</span></div>'; });
      rows += '<div class="bb-row"><span>' + esc(C.base.title) + '</span><span>' + money(basePrice) + '</span></div>';
      rows += '<div class="bb-row bb-row--total"><span>Total</span><span>' + money(priceOf(state.beads)) + '</span></div>';
      $('[data-summary]').innerHTML = rows;
      $('[data-used]').textContent = n; $('[data-of]').textContent = 'of ' + c + ' beads';
      $('[data-length]').textContent = (n * C.beadLengthCm + C.claspAllowanceCm).toFixed(1) + ' cm with clasp';
      $('[data-fill]').style.width = (c ? n / c * 100 : 0) + '%';
      var hint = $('[data-hint]'); hint.classList.remove('bb-warn');
      if (state.label === 'sample') hint.textContent = 'This is a sample design. Clear it to start your own, or tap beads to change it.';
      else if (state.label) hint.textContent = 'Started from ' + state.label + '. Add, remove or shuffle beads to make it yours.';
      else if (!n) hint.textContent = 'Add beads from Step 2 to see them on the bracelet.';
      else if (n < c) { hint.textContent = (c - n) + ' space' + (c - n > 1 ? 's' : '') + ' left. A full bracelet sits best on the wrist.'; hint.classList.add('bb-warn'); }
      else hint.textContent = 'Your bracelet is full.';
      $('[data-total]').textContent = money(priceOf(state.beads));
      $('[data-add]').disabled = !n;
      $('[data-undo]').disabled = !n; $('[data-shuffle]').disabled = n < 2; $('[data-clear]').disabled = !n;
    }
    function render() {
      renderSizes(); renderProducts(); renderSeq();
      $('[data-ring]').innerHTML = ringSVG(state.beads, cap());
      renderSummary();
    }

    $('[data-undo]').addEventListener('click', function () { state.beads.pop(); touched(); render(); });
    $('[data-clear]').addEventListener('click', function () { state.beads = []; touched(); render(); });
    $('[data-shuffle]').addEventListener('click', function () {
      for (var i = state.beads.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = state.beads[i]; state.beads[i] = state.beads[j]; state.beads[j] = t; }
      touched(); render();
    });

    $('[data-add]').addEventListener('click', function () {
      var err = $('[data-error]'); err.textContent = '';
      var k = counts();
      var missing = products.filter(function (p) { return k[p.id] && !p.variantId; });
      if (!C.base.variantId || missing.length) {
        err.textContent = 'This bracelet can\'t be added yet: the shop still needs to link its products in the theme editor.';
        return;
      }
      var s = size();
      var id = 'B' + Date.now().toString(36).toUpperCase();
      var design = state.beads.map(function (b) { return byId[b.pid].name; });
      var items = [{
        id: C.base.variantId, quantity: 1,
        properties: {
          'Size': fitName() + ' ' + s[state.fit] + ' (' + s.cm[0] + '–' + s.cm[1] + ' cm)',
          'Beads': state.beads.length + ' of ' + cap(),
          'Bead order': design.join(', '),
          '_Bracelet ID': id
        }
      }];
      products.forEach(function (p) {
        if (k[p.id]) items.push({ id: p.variantId, quantity: k[p.id], properties: { 'For bracelet': id, '_Bracelet ID': id } });
      });
      var btn = $('[data-add]'); btn.disabled = true; btn.setAttribute('aria-busy', 'true');
      fetch(C.cartAddUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items: items }) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.description || j.message || 'Could not add to basket'); return j; }); })
        .then(function () { window.location.href = C.cartUrl; })
        .catch(function (e) { err.textContent = e.message + '. Please try again.'; btn.disabled = false; btn.removeAttribute('aria-busy'); });
    });

    // Bestseller banner "Customise this design" buttons send a pattern of bead names.
    function loadPattern(names, name, scroll) {
      var ids = names.map(function (nm) {
        var p = products.find(function (x) { return x.name.toLowerCase() === String(nm).trim().toLowerCase(); });
        return p && p.id;
      }).filter(Boolean);
      if (!ids.length) return;
      var med = sizes.findIndex(function (s) { return s.women === 'Medium'; });
      state.fit = 'women'; state.sizeIdx = med >= 0 ? med : defaultIdx;
      state.beads = []; for (var i = 0; i < cap(); i++) state.beads.push(newBead(ids[i % ids.length]));
      state.label = name || 'a bestseller';
      render();
      if (scroll) root.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    document.addEventListener('bracelet:load-pattern', function (e) {
      loadPattern((e.detail && e.detail.pattern) || [], e.detail && e.detail.name, true);
    });

    render();
    // Arriving from a bestseller's "Customise this design" link: ?pattern=Blue/Green,Peach/Grey&from=Seaglass
    var params = new URLSearchParams(window.location.search);
    if (params.get('pattern')) loadPattern(params.get('pattern').split(','), params.get('from'), false);
  }

  function boot() { document.querySelectorAll('[data-bead-builder]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  document.addEventListener('shopify:section:load', boot);
})();
