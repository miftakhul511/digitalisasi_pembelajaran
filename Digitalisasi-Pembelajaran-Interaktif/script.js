(() => {
  'use strict';
  const slides = [...document.querySelectorAll('.slide')];
  const dots = document.querySelector('#dots');
  const label = document.querySelector('#slide-label');
  const counter = document.querySelector('#current-number');
  const fill = document.querySelector('#progress-fill');
  const prev = document.querySelector('#prev-btn');
  const next = document.querySelector('#next-btn');
  const overview = document.querySelector('#overview');
  const overviewList = document.querySelector('#overview-list');
  let index = 0;

  slides.forEach((slide, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `${i + 1}. ${slide.dataset.title}`);
    dot.addEventListener('click', () => go(i));
    dots.append(dot);
    const item = document.createElement('button');
    item.type = 'button';
    item.textContent = `${String(i + 1).padStart(2, '0')}  ${slide.dataset.title}`;
    item.addEventListener('click', () => { overview.close(); go(i); });
    overviewList.append(item);
  });
  const allDots = [...dots.children];
  function go(target) {
    index = Math.max(0, Math.min(slides.length - 1, target));
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
    });
    allDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      if (i === index) dot.setAttribute('aria-current', 'step');
      else dot.removeAttribute('aria-current');
    });
    label.textContent = slides[index].dataset.title;
    counter.textContent = String(index + 1).padStart(2, '0');
    fill.style.width = `${((index + 1) / slides.length) * 100}%`;
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  document.querySelectorAll('[data-next]').forEach(button => button.addEventListener('click', () => go(index + 1)));
  document.querySelector('#overview-btn').addEventListener('click', () => overview.showModal());
  document.querySelector('#close-overview').addEventListener('click', () => overview.close());
  overview.addEventListener('click', event => { if (event.target === overview) overview.close(); });
  document.querySelector('#fullscreen-btn').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch { /* Some browsers do not allow fullscreen from local files. */ }
  });
  document.addEventListener('keydown', event => {
    if (overview.open || /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); go(index + 1); }
    if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); go(index - 1); }
  });

  document.querySelectorAll('.facility').forEach(button => button.addEventListener('click', () => {
    button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
  }));
  document.querySelectorAll('.compare-card').forEach(card => card.addEventListener('click', () => {
    document.querySelectorAll('.compare-card').forEach(other => other.setAttribute('aria-pressed', String(other === card)));
  }));

  const actions = {
    memilih: ['✓', 'Memilih jawaban', 'Siswa menjawab pertanyaan, memilih gambar, atau menentukan langkah berikutnya.'],
    mencoba: ['✳', 'Mencoba langsung', 'Siswa menyentuh atau memindahkan objek di IFP dan mencoba simulasi sederhana.'],
    berdiskusi: ['☷', 'Berdiskusi', 'Siswa menjelaskan alasan pilihan kepada teman dan membandingkan berbagai cara berpikir.'],
    umpan: ['↗', 'Menerima umpan balik', 'Guru membahas jawaban, meluruskan kekeliruan, dan mengajak siswa mencoba kembali.']
  };
  document.querySelectorAll('.action-tab').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('.action-tab').forEach(tab => {
      tab.classList.toggle('selected', tab === button);
      tab.setAttribute('aria-pressed', String(tab === button));
    });
    const [symbol, title, copy] = actions[button.dataset.action];
    document.querySelector('#action-symbol').textContent = symbol;
    document.querySelector('#action-title').textContent = title;
    document.querySelector('#action-copy').textContent = copy;
  }));

  document.querySelectorAll('[data-quiz]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-quiz]').forEach(option => option.classList.remove('correct', 'incorrect'));
    const correct = button.dataset.quiz === 'b';
    button.classList.add(correct ? 'correct' : 'incorrect');
    document.querySelector('#quiz-feedback').textContent = correct
      ? 'Tepat. Bahas alasan jawaban siswa, lalu jelaskan kembali konsep yang masih sulit.'
      : 'Coba pikirkan cara memakai respons siswa untuk mengetahui bagian yang belum dipahami.';
  }));

  let selectedTerm = null;
  let matched = 0;
  const status = document.querySelector('#match-status');
  const matchItems = [...document.querySelectorAll('.match-item')];
  matchItems.forEach(button => button.addEventListener('click', () => {
    if (button.classList.contains('matched')) return;
    if (button.dataset.side === 'term') {
      if (selectedTerm) selectedTerm.classList.remove('selected');
      selectedTerm = button;
      button.classList.add('selected');
      status.textContent = `Dipilih: ${button.textContent}. Sekarang pilih penjelasannya.`;
      return;
    }
    if (!selectedTerm) { status.textContent = 'Pilih istilah di kolom kiri terlebih dahulu.'; return; }
    if (button.dataset.id === selectedTerm.dataset.id) {
      button.classList.add('matched');
      selectedTerm.classList.remove('selected');
      selectedTerm.classList.add('matched');
      selectedTerm = null;
      matched++;
      status.textContent = matched === 3 ? 'Hebat! Semua pasangan benar. Sekarang bahas alasannya bersama.' : `Benar! Pasangan benar: ${matched}/3`;
    } else {
      button.classList.add('wrong');
      status.textContent = 'Belum tepat. Coba penjelasan yang lain.';
      window.setTimeout(() => button.classList.remove('wrong'), 450);
    }
  }));
  document.querySelector('#reset-match').addEventListener('click', () => {
    matched = 0;
    selectedTerm = null;
    matchItems.forEach(button => button.classList.remove('matched', 'selected', 'wrong'));
    status.textContent = 'Pasangan benar: 0/3';
  });

  // If the presenter supplies a background file, use it on every slide.
  const backgroundFiles = ['background.png', 'background.jpg', 'background.jpeg', 'background.webp'];
  function tryBackground(position) {
    if (position >= backgroundFiles.length) return;
    const path = `assets/background/${backgroundFiles[position]}`;
    const img = new Image();
    img.onload = () => document.documentElement.style.setProperty('--slide-background', `url("${path}")`);
    img.onerror = () => tryBackground(position + 1);
    img.src = path;
  }
  tryBackground(0);
  go(0);
})();
