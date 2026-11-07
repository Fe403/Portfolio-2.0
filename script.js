/* ===== Intro ===== */
const intro = document.getElementById('intro');

if (intro) {
  const barra = intro.querySelector('.intro-barra span');
  const contador = intro.querySelector('.intro-contador');
  let valor = 0;
  let carregou = document.readyState === 'complete';
  window.addEventListener('load', () => (carregou = true));

  function terminarIntro() {
    intro.classList.add('saindo');                 // a cortina sobe
    document.body.classList.remove('carregando');  // libera o scroll e as animações
    setTimeout(() => intro.remove(), 1100);        // tira do HTML depois
  }

  const timer = setInterval(() => {
    const limite = carregou ? 100 : 90;            // trava em 90% até a página carregar de verdade
    valor = Math.min(valor + Math.floor(Math.random() * 8) + 3, limite);

    barra.style.width = valor + '%';
    contador.textContent = valor + '%';

    if (valor === 100) {
      clearInterval(timer);
      setTimeout(terminarIntro, 400);
    }
  }, 90);
}

/* ===== Tema escuro / claro ===== */
const botaoTema = document.getElementById('tema');
const textoTema = document.getElementById('tema-texto');

function aplicarTema(claro) {
  document.body.classList.toggle('claro', claro);
  textoTema.textContent = claro ? 'Preto' : 'Branco';
  localStorage.setItem('tema', claro ? 'claro' : 'escuro');
}

aplicarTema(localStorage.getItem('tema') === 'claro');

botaoTema.addEventListener('click', () => {
  aplicarTema(!document.body.classList.contains('claro'));
  textoTema.classList.add('virar');   // o texto "vira" ao trocar
  textoTema.addEventListener('animationend', () => textoTema.classList.remove('virar'), { once: true });
});

/* ===== Onda ao clicar nos botões ===== */
document.querySelectorAll('button, .btn, .links a').forEach((el) => {
  el.addEventListener('click', (e) => {
    const r = el.getBoundingClientRect();
    const tamanho = Math.max(r.width, r.height);

    const onda = document.createElement('span');
    onda.className = 'onda';
    onda.style.width = onda.style.height = tamanho + 'px';
    onda.style.left = e.clientX - r.left - tamanho / 2 + 'px';
    onda.style.top = e.clientY - r.top - tamanho / 2 + 'px';

    el.appendChild(onda);
    onda.addEventListener('animationend', () => onda.remove());
  });
});

/* ===== Suavização: o valor "persegue" o alvo aos poucos ===== */
const lerp = (a, b, t) => a + (b - a) * t;

/* ===== Cards de projeto: inclinação suave ===== */
document.querySelectorAll('.projeto').forEach((card) => {
  let rect;
  let rx = 0, ry = 0, lev = 0;                // onde o card está agora
  let alvoRx = 0, alvoRy = 0, alvoLev = 0;    // para onde ele quer ir
  let raf = null;

  function animar() {
    rx = lerp(rx, alvoRx, 0.12);
    ry = lerp(ry, alvoRy, 0.12);
    lev = lerp(lev, alvoLev, 0.12);

    card.style.transform =
      `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${-8 * lev}px)`;

    const parado =
      Math.abs(rx - alvoRx) < 0.01 &&
      Math.abs(ry - alvoRy) < 0.01 &&
      Math.abs(lev - alvoLev) < 0.01;

    if (parado) {
      raf = null;
      if (alvoLev === 0) card.style.transform = '';
    } else {
      raf = requestAnimationFrame(animar);   // continua no próximo quadro
    }
  }
  const iniciar = () => { if (!raf) raf = requestAnimationFrame(animar); };

  card.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    rect = card.getBoundingClientRect();     // medido em repouso: evita tremedeira
    alvoLev = 1;
    iniciar();
  });
  card.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || !rect) return;
    alvoRy = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    alvoRx = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    iniciar();
  });
  card.addEventListener('pointerleave', () => {
    alvoRx = alvoRy = alvoLev = 0;
    iniciar();
  });
});

/* ===== Aparecer ao rolar a página ===== */
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('visivel');
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.certificado').forEach((el, i) => {
  el.style.setProperty('--atraso', `${i * 0.15}s`);   // um depois do outro
  el.classList.add('revelar');
  observador.observe(el);
});

/* ===== Formulário ===== */
const form = document.querySelector('form');

if (form) {
  form.classList.add('revelar');
  observador.observe(form);

  const textoEnviar = form.querySelector('button span:not(.onda)');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // a carta "pula" ao enviar
    form.animate([
      { transform: 'rotate(.6deg)' },
      { transform: 'translateY(-18px) scale(.97) rotate(-1.5deg)', offset: 0.35 },
      { transform: 'translateY(-36px) scale(.93) rotate(1deg)', offset: 0.65 },
      { transform: 'rotate(.6deg)' }
    ], { duration: 900, easing: 'cubic-bezier(.22, 1, .36, 1)' });

    // envelope voando
    const envelope = document.createElement('span');
    envelope.className = 'voando';
    envelope.textContent = '✉';
    form.appendChild(envelope);
    envelope.animate([
      { transform: 'translate(-50%, -50%) scale(.6) rotate(0deg)', opacity: 1 },
      { transform: 'translate(40vw, -60vh) scale(1.6) rotate(25deg)', opacity: 0 }
    ], { duration: 1100, easing: 'ease-in' }).onfinish = () => envelope.remove();

    textoEnviar.textContent = 'Mensagem enviada! ✓';
    form.reset();
    setTimeout(() => (textoEnviar.textContent = 'Enviar mensagem →'), 3000);
  });
}

/* ===== Títulos: separar em letras e animar ===== */
function dividirLetras(el) {
  let indice = 0;
  let texto = '';

  function processar(no) {
    [...no.childNodes].forEach((filho) => {
      if (filho.nodeType === 3) {                       // é um texto
        const pedaco = document.createDocumentFragment();
        filho.textContent.split(/(\s+)/).forEach((parte) => {
          if (!parte) return;
          if (/^\s+$/.test(parte)) {                    // espaço entre palavras
            pedaco.appendChild(document.createTextNode(' '));
            texto += ' ';
            return;
          }
          const palavra = document.createElement('span');
          palavra.className = 'palavra';
          palavra.setAttribute('aria-hidden', 'true');
          [...parte].forEach((letra) => {
            const s = document.createElement('span');
            s.className = 'letra';
            s.textContent = letra;
            s.style.setProperty('--i', indice++);       // posição da letra (para o atraso)
            palavra.appendChild(s);
          });
          texto += parte;
          pedaco.appendChild(palavra);
        });
        no.replaceChild(pedaco, filho);
      } else if (filho.nodeName === 'BR') {
        texto += ' ';
      } else {
        processar(filho);                               // entra em <span> e similares
      }
    });
  }

  processar(el);
  el.setAttribute('aria-label', texto.trim());          // leitores de tela leem o título inteiro
}

document.querySelectorAll('h1, #projetos h2, #diplomas h2, #contato h2').forEach((titulo) => {
  dividirLetras(titulo);
  titulo.classList.add('titulo-anima');
  observador.observe(titulo);                           // anima quando aparecer na tela
});

/* ===== Foto: parallax 3D suave ===== */
const visual = document.querySelector('.hero-visual');

if (visual) {
  let x = 0, y = 0, alvoX = 0, alvoY = 0, raf = null;

  function mover() {
    x = lerp(x, alvoX, 0.08);
    y = lerp(y, alvoY, 0.08);
    visual.style.setProperty('--px', x.toFixed(3));
    visual.style.setProperty('--py', y.toFixed(3));

    const parado = Math.abs(x - alvoX) < 0.001 && Math.abs(y - alvoY) < 0.001;
    raf = parado ? null : requestAnimationFrame(mover);
  }
  const iniciar = () => { if (!raf) raf = requestAnimationFrame(mover); };

  visual.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = visual.getBoundingClientRect();
    alvoX = ((e.clientX - r.left) / r.width - 0.5) * 2;
    alvoY = ((e.clientY - r.top) / r.height - 0.5) * 2;
    iniciar();
  });
  visual.addEventListener('pointerleave', () => { alvoX = alvoY = 0; iniciar(); });
}