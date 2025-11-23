// MINI UI DESIGNER — Full Version (One-time Placement + Accurate Click Position)
(() => {
  const components = [
    { type: 'div', label: 'Box / Div', width: 200, height: 100, content: 'Box', styles: { background: '#eee', color: '#222' }},
    { type: 'button', label: 'Button', width: 100, height: 40, content: 'Click Me', styles: { background: '#1f6feb', color: '#fff', borderRadius: 4 }},
    { type: 'heading', label: 'Heading (H2)', width: 320, height: 50, content: 'Heading', styles: { fontWeight: '700', fontSize: '24px', color: '#222' }},
    { type: 'paragraph', label: 'Paragraph', width: 320, height: 80, content: 'Lorem ipsum dolor sit.', styles: { fontSize: '14px', color: '#333' }},
    { type: 'input', label: 'Input Field', width: 240, height: 36, content: '', styles: { background: '#fff', border: '1px solid #ccc', borderRadius: 4 }},
    { type: 'textarea', label: 'Textarea', width: 320, height: 90, content: '', styles: { background: '#fff', border: '1px solid #ccc', borderRadius: 4 }},
    { type: 'select', label: 'Select Dropdown', width: 200, height: 36, options: ['Option 1', 'Option 2'], styles: { background: '#fff', border: '1px solid #ccc', borderRadius: 4 }},
    { type: 'checkbox', label: 'Checkbox', width: 20, height: 20, styles: { background: 'transparent' }},
    { type: 'image', label: 'Image', width: 320, height: 180, src: 'https://picsum.photos/320/180', styles: { borderRadius: 6 }},
    { type: 'video', label: 'Video', width: 360, height: 240, src: 'https://www.w3schools.com/html/mov_bbb.mp4', styles: { borderRadius: 6 }}
  ];

  const canvas = document.getElementById('canvas');
  const canvasWrapper = document.getElementById('canvasWrapper');
  const componentsList = document.getElementById('componentsList');
  const layersPanel = document.getElementById('layersPanel');
  const propsPanel = document.getElementById('propsPanel');
  const elCount = document.getElementById('elCount');
  const zoomVal = document.getElementById('zoomVal');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const exportBtn = document.getElementById('exportBtn');
  const livePreviewBtn = document.getElementById('livePreviewBtn');
  const bringFrontBtn = document.getElementById('bringFrontBtn');
  const sendBackBtn = document.getElementById('sendBackBtn');
  const bringForwardBtn = document.getElementById('bringForwardBtn');
  const sendBackwardBtn = document.getElementById('sendBackwardBtn');
  const minTopbar = document.getElementById('minTopbar');
  const minLeft = document.getElementById('minLeft');
  const minRight = document.getElementById('minRight');

  let state = { elements: [], selectedIds: [], undoStack: [], redoStack: [], zoom: 1 };
  let pendingComponent = null;
  const gridSize = 20;
  const fontsList = ['Inter','Arial','Poppins','Roboto','Montserrat','Open Sans','Lato','Courier New','Georgia','Times New Roman'];

  const createId = () => 'id_' + Math.random().toString(36).slice(2, 9);

  const saveState = () => {
    state.undoStack.push(JSON.stringify(state.elements));
    if (state.undoStack.length > 50) state.undoStack.shift();
    state.redoStack = [];
    updateButtons();
  };

  const undo = () => {
    if (!state.undoStack.length) return;
    state.redoStack.push(JSON.stringify(state.elements));
    state.elements = JSON.parse(state.undoStack.pop());
    state.selectedIds = [];
    renderAll();
    updateButtons();
  };

  const redo = () => {
    if (!state.redoStack.length) return;
    state.undoStack.push(JSON.stringify(state.elements));
    state.elements = JSON.parse(state.redoStack.pop());
    state.selectedIds = [];
    renderAll();
    updateButtons();
  };

  const updateButtons = () => {
    undoBtn.disabled = !state.undoStack.length;
    redoBtn.disabled = !state.redoStack.length;
  };

  const renderComponentsList = () => {
    componentsList.innerHTML = '';
    components.forEach(c => {
      const div = document.createElement('div');
      div.className = 'component-item';
      div.textContent = c.label;
      div.onclick = () => {
        pendingComponent = c;
        componentsList.querySelectorAll('.component-item').forEach(i => i.classList.remove('active'));
        div.classList.add('active');
      };
      componentsList.appendChild(div);
    });
  };

  const renderAll = () => {
    renderCanvas();
    renderLayers();
    renderProps();
    elCount.textContent = state.elements.length;
    zoomVal.textContent = Math.round(state.zoom * 100) + '%';
  };

  const applyTextStyles = (n, el) => {
    n.style.fontFamily = el.styles.fontFamily;
    n.style.fontStyle = el.styles.fontStyle;
    n.style.fontWeight = el.styles.fontWeight;
    n.style.textAlign = el.styles.textAlign;
    n.style.fontSize = el.styles.fontSize || '14px';
  };

  const renderCanvas = () => {
    canvas.innerHTML = '';
    canvas.style.transform = `scale(${state.zoom})`;
    canvas.style.transformOrigin = '0 0';
    canvas.style.backgroundSize = `${gridSize}px ${gridSize}px`;

    const maxBottom = state.elements.reduce(
      (m, e) => Math.max(m, e.y + e.height),
      0
    );
    canvas.style.height = Math.max(2000, maxBottom + 200) + 'px';
    const maxRight = state.elements.reduce(
      (m, e) => Math.max(m, e.x + e.width),
      0
    );
    canvas.style.width = Math.max(3000, maxRight + 200) + 'px';

    state.elements.forEach(el => {
      const n = document.createElement('div');
      n.className = 'canvas-element';
      if (state.selectedIds.includes(el.id)) n.classList.add('selected');

      Object.assign(n.style, {
        left: el.x + 'px',
        top: el.y + 'px',
        width: el.width + 'px',
        height: el.height + 'px',
        background: el.styles.background || 'transparent',
        color: el.styles.color || '#000',
        borderRadius: el.styles.borderRadius || '6px',
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'move',
        boxSizing: 'border-box'
      });
      applyTextStyles(n, el);

      if (el.type === 'image') {
        const img = document.createElement('img');
        img.src = el.src;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        n.appendChild(img);
      } else if (el.type === 'video') {
        const vid = document.createElement('video');
        const v = el.videoProps || { controls: true, loop: false, muted: false, autoplay: false };
        vid.src = el.src;
        vid.controls = v.controls;
        vid.loop = v.loop;
        vid.muted = v.muted;
        vid.autoplay = v.autoplay;
        vid.style.width = '100%';
        vid.style.height = '100%';
        vid.style.objectFit = 'cover';
        n.appendChild(vid);
      } else if (el.type === 'input') {
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.value = el.content;
        inp.style.width = '90%';
        inp.style.height = '60%';
        applyTextStyles(inp, el);
        n.appendChild(inp);
      } else if (el.type === 'textarea') {
        const ta = document.createElement('textarea');
        ta.value = el.content;
        ta.style.width = '90%';
        ta.style.height = '70%';
        applyTextStyles(ta, el);
        n.appendChild(ta);
      } else if (el.type === 'select') {
        const sel = document.createElement('select');
        el.options.forEach(o => {
          const op = document.createElement('option');
          op.textContent = o;
          sel.appendChild(op);
        });
        sel.style.width = '90%';
        sel.style.height = '70%';
        applyTextStyles(sel, el);
        n.appendChild(sel);
      } else {
        n.textContent = el.content;
      }

      n.onclick = e => { e.stopPropagation(); selectElement(el.id); };
      n.onmousedown = e => { e.stopPropagation(); startDrag(e, el.id); };

      if (state.selectedIds.includes(el.id)) {
        ['nw', 'ne', 'sw', 'se'].forEach(pos => {
          const h = document.createElement('div');
          h.className = 'resize-handle ' + pos;
          h.onmousedown = e => { e.stopPropagation(); startResize(e, el.id, pos); };
          n.appendChild(h);
        });
      }

      canvas.appendChild(n);
    });
  };

  const renderLayers = () => {
    layersPanel.innerHTML = '';
    layersPanel.ondragover = e => e.preventDefault();

    state.elements.slice().reverse().forEach(el => {
      const d = document.createElement('div');
      d.className = 'layer-item ' + (state.selectedIds.includes(el.id) ? 'selected' : '');
      d.textContent = `${el.type} (${el.id.slice(-4)})`;
      d.draggable = true;
      d.onclick = () => selectElement(el.id);
      d.ondragstart = e => {
        e.dataTransfer.setData('text/plain', el.id);
        d.style.opacity = '0.5';
      };
      d.ondragend = () => { d.style.opacity = '1'; };
      d.ondrop = e => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedIndex = state.elements.findIndex(x => x.id === draggedId);
        const targetIndex = state.elements.findIndex(x => x.id === el.id);
        if (draggedIndex === -1 || targetIndex === -1) return;
        const moved = state.elements.splice(draggedIndex, 1)[0];
        const actualTarget = state.elements.length - 1 - targetIndex;
        state.elements.splice(actualTarget, 0, moved);
        saveState();
        renderAll();
      };
      layersPanel.appendChild(d);
    });
  };

  function bringToFront() {
    if (!state.selectedIds.length) return;
    const id = state.selectedIds[0];
    const i = state.elements.findIndex(e => e.id === id);
    const el = state.elements.splice(i, 1)[0];
    state.elements.push(el);
    saveState();
    renderAll();
  }

  function sendToBack() {
    if (!state.selectedIds.length) return;
    const id = state.selectedIds[0];
    const i = state.elements.findIndex(e => e.id === id);
    const el = state.elements.splice(i, 1)[0];
    state.elements.unshift(el);
    saveState();
    renderAll();
  }

  function bringForward() {
    if (!state.selectedIds.length) return;
    const id = state.selectedIds[0];
    const i = state.elements.findIndex(e => e.id === id);
    if (i < state.elements.length - 1) {
      [state.elements[i], state.elements[i + 1]] = [state.elements[i + 1], state.elements[i]];
      saveState();
      renderAll();
    }
  }

  function sendBackward() {
    if (!state.selectedIds.length) return;
    const id = state.selectedIds[0];
    const i = state.elements.findIndex(e => e.id === id);
    if (i > 0) {
      [state.elements[i], state.elements[i - 1]] = [state.elements[i - 1], state.elements[i]];
      saveState();
      renderAll();
    }
  }

  function renderProps() {
    propsPanel.innerHTML = '';
    if (!state.selectedIds.length) {
      propsPanel.textContent = 'Select an element to edit.';
      return;
    }
    const el = state.elements.find(x => x.id === state.selectedIds[0]);

    const addField = (l, t, v, cb) => {
      const g = document.createElement('div'); g.className = 'prop-group';
      const lbl = document.createElement('label'); lbl.textContent = l;
      const inp = document.createElement('input'); inp.type = t; inp.value = v || '';
      inp.oninput = e => cb(e.target.value, false);
      inp.onblur = e => cb(e.target.value, true);
      g.append(lbl, inp); propsPanel.append(g);
    };

    const addSelect = (l, opts, v, cb) => {
      const g = document.createElement('div'); g.className = 'prop-group';
      const lbl = document.createElement('label'); lbl.textContent = l;
      const sel = document.createElement('select');
      opts.forEach(o => {
        const op = document.createElement('option');
        op.value = o; op.textContent = o;
        if (o === v) op.selected = true;
        sel.appendChild(op);
      });
      sel.onchange = e => cb(e.target.value);
      g.append(lbl, sel); propsPanel.append(g);
    };

    const addCheck = (l, c, cb) => {
      const g = document.createElement('div'); g.className = 'prop-group';
      const i = document.createElement('input'); i.type = 'checkbox'; i.checked = c;
      i.onchange = e => cb(e.target.checked);
      const lbl = document.createElement('label'); lbl.textContent = ' ' + l; lbl.prepend(i);
      g.append(lbl); propsPanel.append(g);
    };

    if (['div', 'button', 'heading', 'paragraph', 'input', 'textarea'].includes(el.type))
      addField('Content', 'text', el.content, (v, d) => { el.content = v; if (d) renderAll(); });

    if (el.type === 'image' || el.type === 'video')
      addField('Source URL', 'text', el.src, (v, d) => { el.src = v; if (d) renderAll(); });

    if (el.type === 'video') {
      if (!el.videoProps) el.videoProps = { controls: true, loop: false, muted: false, autoplay: false, volume: 1 };
      addCheck('Show Controls', el.videoProps.controls, v => { el.videoProps.controls = v; renderAll(); });
      addCheck('Loop', el.videoProps.loop, v => { el.videoProps.loop = v; renderAll(); });
      addCheck('Muted', el.videoProps.muted, v => { el.videoProps.muted = v; renderAll(); });
      addCheck('Autoplay', el.videoProps.autoplay, v => { el.videoProps.autoplay = v; renderAll(); });
    }

    if (['div', 'button', 'heading', 'paragraph', 'input', 'textarea', 'select'].includes(el.type)) {
      addSelect('Font Family', fontsList, el.styles.fontFamily, v => { el.styles.fontFamily = v; renderAll(); });
      addSelect('Text Align', ['left', 'center', 'right'], el.styles.textAlign, v => { el.styles.textAlign = v; renderAll(); });
      addCheck('Bold', el.styles.fontWeight === '700', v => { el.styles.fontWeight = v ? '700' : '400'; renderAll(); });
      addCheck('Italic', el.styles.fontStyle === 'italic', v => { el.styles.fontStyle = v ? 'italic' : 'normal'; renderAll(); });
    }

    if (!el.backgroundType) el.backgroundType = 'color';
    addSelect('Background Type', ['color', 'image', 'video'], el.backgroundType, v => {
      el.backgroundType = v;
      if (v === 'color') { el.styles.background = '#ffffff'; el.bgSrc = null; }
      if (v === 'image') { el.bgSrc = ''; el.styles.background = 'transparent'; }
      if (v === 'video') { el.bgSrc = ''; el.styles.background = 'transparent'; }
      renderAll(); renderProps();
    });

    if (el.backgroundType === 'color') {
      addField('Background Color', 'color', el.styles.background, (v, d) => { el.styles.background = v; if (d) renderAll(); });
    } else if (el.backgroundType === 'image') {
      addField('Image URL', 'text', el.bgSrc, (v, d) => { el.bgSrc = v; if (d) renderAll(); });
    } else if (el.backgroundType === 'video') {
      addField('Video URL', 'text', el.bgSrc, (v, d) => { el.bgSrc = v; if (d) renderAll(); });
      if (!el.bgVideoProps) el.bgVideoProps = { controls: false, loop: true, muted: true, autoplay: true };
      addCheck('Show Controls', el.bgVideoProps.controls, v => { el.bgVideoProps.controls = v; renderAll(); });
      addCheck('Loop', el.bgVideoProps.loop, v => { el.bgVideoProps.loop = v; renderAll(); });
      addCheck('Muted', el.bgVideoProps.muted, v => { el.bgVideoProps.muted = v; renderAll(); });
      addCheck('Autoplay', el.bgVideoProps.autoplay, v => { el.bgVideoProps.autoplay = v; renderAll(); });
    }

    [['Color', 'color'], ['Radius(px)', 'borderRadius'], ['Font Size(px)', 'fontSize']]
      .forEach(([l, p]) => addField(
        l,
        p === 'color' ? 'color' : 'number',
        el.styles[p]?.replace('px', '') || '',
        (v, d) => { el.styles[p] = p === 'color' ? v : v + 'px'; if (d) renderAll(); }
      ));

    [['X', 'x'], ['Y', 'y'], ['W', 'width'], ['H', 'height']]
      .forEach(([l, p]) => addField(
        l,
        'number',
        el[p],
        (v, d) => { el[p] = parseInt(v) || el[p]; if (d) renderAll(); }
      ));
  }

  const selectElement = id => { state.selectedIds = [id]; renderAll(); };

  let dragInfo = null;
  const startDrag = (e, id) => {
    const el = state.elements.find(x => x.id === id);
    dragInfo = { el, startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y };
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', endDrag);
  };

  const onDrag = e => {
    if (!dragInfo) return;
    const dx = (e.clientX - dragInfo.startX) / state.zoom;
    const dy = (e.clientY - dragInfo.startY) / state.zoom;
    dragInfo.el.x = Math.round((dragInfo.origX + dx) / gridSize) * gridSize;
    dragInfo.el.y = Math.round((dragInfo.origY + dy) / gridSize) * gridSize;
    renderAll();
  };

  const endDrag = () => {
    if (dragInfo) {
      saveState();
      dragInfo = null;
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mouseup', endDrag);
    }
  };

  let resizeInfo = null;
  const startResize = (e, id) => {
    const el = state.elements.find(x => x.id === id);
    resizeInfo = { el, startX: e.clientX, startY: e.clientY, w: el.width, h: el.height };
    window.addEventListener('mousemove', onResize);
    window.addEventListener('mouseup', endResize);
  };

  const onResize = e => {
    if (!resizeInfo) return;
    const dx = (e.clientX - resizeInfo.startX) / state.zoom;
    const dy = (e.clientY - resizeInfo.startY) / state.zoom;
    resizeInfo.el.width = Math.max(20, resizeInfo.w + dx);
    resizeInfo.el.height = Math.max(20, resizeInfo.h + dy);
    renderAll();
  };

  const endResize = () => {
    if (resizeInfo) {
      saveState();
      resizeInfo = null;
      window.removeEventListener('mousemove', onResize);
      window.removeEventListener('mouseup', endResize);
    }
  };

  // ---------- EXPORT: single normal scrollbar, artboard grows to full design height ----------
  const generateExportHTML = () => {
    const gf = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Poppins:wght@400;700&family=Roboto:wght@400;700&family=Montserrat:wght@400;700&family=Open+Sans:wght@400;700&family=Lato:wght@400;700&display=swap" rel="stylesheet">`;
    let i = n => '  '.repeat(n);

    const maxBottom = state.elements.reduce(
      (m, el) => Math.max(m, el.y + el.height),
      0
    );
    const artboardHeight = Math.max(maxBottom + 100, 600); // ensures heading/images also on white artboard

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
${i(1)}<meta charset="UTF-8"/>
${i(1)}<meta name="viewport" content="width=device-width, initial-scale=1"/>
${i(1)}${gf}
${i(1)}<title>Exported UI</title>
${i(1)}<style>
${i(2)}html,body{margin:0;padding:0;background:#eceff1;}
${i(2)}.artboard{position:relative;min-width:100vw;background:#fff;}
${i(2)}img,video{max-width:100%;border-radius:8px;}
${i(1)}</style>
</head>
<body>
${i(1)}<div class="artboard" style="height:${artboardHeight}px;">
`;

    state.elements.forEach(el => {
      const s =
        `position:absolute;left:${el.x}px;top:${el.y}px;` +
        `width:${el.width}px;height:${el.height}px;` +
        `${el.styles.background ? `background:${el.styles.background};` : ''}` +
        `${el.styles.color ? `color:${el.styles.color};` : ''}` +
        `${el.styles.borderRadius ? `border-radius:${el.styles.borderRadius};` : ''}` +
        `font-family:${el.styles.fontFamily};font-style:${el.styles.fontStyle};font-weight:${el.styles.fontWeight};` +
        `text-align:${el.styles.textAlign};font-size:${el.styles.fontSize};` +
        `display:flex;align-items:center;justify-content:center;`;

      if (el.type === 'div') {
        html += `${i(2)}<div style="${s}">${el.content}</div>\n`;
      } else if (el.type === 'button') {
        html += `${i(2)}<button style="${s}">${el.content}</button>\n`;
      } else if (el.type === 'heading') {
        html += `${i(2)}<h2 style="${s}">${el.content}</h2>\n`;
      } else if (el.type === 'paragraph') {
        html += `${i(2)}<p style="${s}">${el.content}</p>\n`;
      } else if (el.type === 'input') {
        html += `${i(2)}<input type="text" style="${s}" value="${el.content}"/>\n`;
      } else if (el.type === 'textarea') {
        html += `${i(2)}<textarea style="${s}">${el.content}</textarea>\n`;
      } else if (el.type === 'select') {
        html += `${i(2)}<select style="${s}">\n`;
        el.options.forEach(o => html += `${i(3)}<option>${o}</option>\n`);
        html += `${i(2)}</select>\n`;
      } else if (el.type === 'checkbox') {
        html += `${i(2)}<input type="checkbox" style="${s}"/>\n`;
      } else if (el.type === 'image') {
        html += `${i(2)}<img src="${el.src}" style="${s}object-fit:cover;"/>\n`;
      } else if (el.type === 'video') {
        const v = el.videoProps || { controls: true, loop: false, muted: false, autoplay: false };
        html += `${i(2)}<video src="${el.src}" style="${s}object-fit:cover;" ${v.controls ? 'controls' : ''} ${v.loop ? 'loop' : ''} ${v.muted ? 'muted' : ''} ${v.autoplay ? 'autoplay' : ''}></video>\n`;
      }
    });

    html += `${i(1)}</div>
</body>
</html>`;
    return html;
  };

  exportBtn.onclick = () => {
    const h = generateExportHTML();
    const b = new Blob([h], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(b);
    a.download = 'exported_ui.html';
    a.click();
  };

  let livePrev = null;
  livePreviewBtn.onclick = () => {
    const h = generateExportHTML();
    if (livePrev && !livePrev.closed) {
      livePrev.document.open();
      livePrev.document.write(h);
      livePrev.document.close();
      livePrev.focus();
    } else {
      livePrev = window.open('', '_blank', 'width=1400,height=800,scrollbars=yes');
      livePrev.document.open();
      livePrev.document.write(h);
      livePrev.document.close();
    }
  };

  window.onkeydown = e => {
    if (e.key === 'Escape') {
      pendingComponent = null;
      componentsList.querySelectorAll('.component-item').forEach(i => i.classList.remove('active'));
    }
    if (e.key === 'Delete' && state.selectedIds.length) {
      state.elements = state.elements.filter(el => !state.selectedIds.includes(el.id));
      state.selectedIds = [];
      saveState();
      renderAll();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') undo();
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') redo();
    if ((e.ctrlKey || e.metaKey) && e.key === ']') { if (e.shiftKey) bringToFront(); else bringForward(); }
    if ((e.ctrlKey || e.metaKey) && e.key === '[') { if (e.shiftKey) sendToBack(); else sendBackward(); }
  };

  // ---- One-time placement + EXACT click-centered coordinates ----
  canvas.addEventListener('click', e => {
    if (!pendingComponent) return;

    const c = pendingComponent;
    pendingComponent = null;
    componentsList.querySelectorAll('.component-item').forEach(i => i.classList.remove('active'));

    const rect = canvas.getBoundingClientRect();

    const baseX = (e.clientX - rect.left) / state.zoom;
    const baseY = (e.clientY - rect.top) / state.zoom;

    const x = Math.round(baseX - c.width / 2);
    const y = Math.round(baseY - c.height / 2);

    const el = {
      id: createId(),
      type: c.type,
      x,
      y,
      width: c.width,
      height: c.height,
      content: c.content || '',
      styles: {
        ...c.styles,
        fontFamily: 'Inter',
        fontStyle: 'normal',
        fontWeight: '400',
        textAlign: 'center'
      },
      options: c.options || null,
      src: c.src || null
    };
    if (el.type === 'video')
      el.videoProps = { controls: true, loop: false, muted: false, autoplay: false, volume: 1 };

    state.elements.push(el);
    state.selectedIds = [el.id];
    saveState();
    renderAll();
  });

  const dragPaneStart = (e, p) => {
    if (p.classList.contains('minimized')) return;
    const sx = e.clientX, sy = e.clientY, r = p.getBoundingClientRect();
    const sl = r.left, st = r.top;
    const move = ev => {
      let x = ev.clientX - sx + sl, y = ev.clientY - sy + st;
      x = Math.max(10, Math.min(x, window.innerWidth - p.offsetWidth - 10));
      y = Math.max(10, Math.min(y, window.innerHeight - p.offsetHeight - 10));
      p.style.left = x + 'px';
      p.style.top = y + 'px';
    };
    const stop = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
  };

  const topPane = document.getElementById('floating-topbar'),
        leftPane = document.getElementById('floating-left'),
        rightPane = document.getElementById('floating-right');

  document.getElementById('drag-topbar').onmousedown = e => dragPaneStart(e, topPane);
  document.getElementById('drag-left').onmousedown = e => dragPaneStart(e, leftPane);
  document.getElementById('drag-right').onmousedown = e => dragPaneStart(e, rightPane);

  minTopbar.onclick = () => {
    topPane.classList.toggle('minimized');
    document.getElementById('topbar-actions').style.display =
      topPane.classList.contains('minimized') ? 'none' : 'flex';
  };
  minLeft.onclick = () => leftPane.classList.toggle('minimized');
  minRight.onclick = () => rightPane.classList.toggle('minimized');

  bringFrontBtn.onclick = bringToFront;
  sendBackBtn.onclick = sendToBack;
  bringForwardBtn.onclick = bringForward;
  sendBackwardBtn.onclick = sendBackward;

  renderComponentsList();
  saveState();
  renderAll();
})();
