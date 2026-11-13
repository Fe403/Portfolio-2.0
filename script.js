/* ===== Intro ===== */
const intro = document.getElementById('intro');

if (intro) {
  // a intro só aparece na primeira visita da sessão (por aba)
  let jaViu = false;
  try { jaViu = sessionStorage.getItem('intro-visto') === '1'; } catch (e) {}

  if (jaViu) {
    intro.remove();
    document.body.classList.remove('carregando');
  } else {
    const TEMPO_MINIMO = 1200;
    const inicio = performance.now();

    function terminarIntro() {
      try { sessionStorage.setItem('intro-visto', '1'); } catch (e) {}
      intro.classList.add('saindo');
      document.body.classList.remove('carregando');
      setTimeout(() => intro.remove(), 1000);
    }

    function quandoPronto() {
      const restante = Math.max(0, TEMPO_MINIMO - (performance.now() - inicio));
      setTimeout(terminarIntro, restante);
    }

    if (document.readyState === 'complete') quandoPronto();
    else window.addEventListener('load', quandoPronto);
  }
}

/* ===== Tema escuro / claro ===== */
const botaoTema = document.getElementById('tema');
const textoTema = document.getElementById('tema-texto');

// localStorage pode estar bloqueado (modo privado, política do navegador): nunca deixa quebrar o site
function lerSalvo(chave) {
  try { return localStorage.getItem(chave); } catch (e) { return null; }
}
function gravarSalvo(chave, valor) {
  try { localStorage.setItem(chave, valor); } catch (e) {}
}

function aplicarTema(claro) {
  document.body.classList.toggle('claro', claro);
  textoTema.textContent = claro ? 'Preto' : 'Branco';
  gravarSalvo('tema', claro ? 'claro' : 'escuro');
}

function virarTexto() {
  textoTema.classList.add('virar');
  textoTema.addEventListener('animationend', () => textoTema.classList.remove('virar'), { once: true });
}

aplicarTema(lerSalvo('tema') === 'claro');

botaoTema.addEventListener('click', () => {
  const vaiFicarClaro = !document.body.classList.contains('claro');
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!document.startViewTransition || reduzir) {
    aplicarTema(vaiFicarClaro);
    virarTexto();
    return;
  }

  const r = botaoTema.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const raio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  document.documentElement.classList.add('trocando-tema');

  const transicao = document.startViewTransition(() => {
    aplicarTema(vaiFicarClaro);
    virarTexto();
  });

  transicao.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`] },
      { duration: 800, easing: 'cubic-bezier(.22, 1, .36, 1)', pseudoElement: '::view-transition-new(root)' }
    );
  });

  transicao.finished.finally(() => document.documentElement.classList.remove('trocando-tema'));
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

/* ===== Cards de projeto: inclinação + luz que segue o mouse OU o dedo ===== */
document.querySelectorAll('.projeto').forEach((card) => {
  let rect;
  let rx = 0, ry = 0, lev = 0;
  let alvoRx = 0, alvoRy = 0, alvoLev = 0;
  let raf = null;
  let ativo = false;   // mouse em cima ou dedo pressionado

  const forcaTilt = (e) => (e.pointerType === 'mouse' ? 12 : 6); // dedo inclina menos

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
      raf = requestAnimationFrame(animar);
    }
  }
  const iniciar = () => { if (!raf) raf = requestAnimationFrame(animar); };

  const entrar = () => {
    ativo = true;
    rect = card.getBoundingClientRect();
    alvoLev = 1;
    iniciar();
  };
  const mover = (e) => {
    if (!ativo || !rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const f = forcaTilt(e);
    alvoRy = (px - 0.5) * f;
    alvoRx = (py - 0.5) * -f;
    card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
    card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    iniciar();
  };
  const sair = () => {
    ativo = false;
    alvoRx = alvoRy = alvoLev = 0;
    iniciar();
  };

  // mouse
  card.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') entrar();
  });
  card.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse') mover(e);
  });
  card.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') sair();
  });

  // toque: inclina enquanto o dedo está pressionado, volta ao soltar
  card.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') entrar();
  });
  card.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') mover(e);
  });
  card.addEventListener('pointerup', (e) => {
    if (e.pointerType !== 'mouse') sair();
  });
  card.addEventListener('pointercancel', (e) => {
    if (e.pointerType !== 'mouse') sair();
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
  el.style.setProperty('--atraso', `${i * 0.15}s`);
  el.classList.add('revelar');
  observador.observe(el);
});

/* ===== Formulário ===== */
const form = document.querySelector('form');

if (form) {
  form.classList.add('revelar');
  observador.observe(form);

  const botao = form.querySelector('button[type="submit"]');
  const textoEnviar = botao.querySelector('span:not(.onda)');
  const aviso = form.querySelector('.form-status');
  let enviando = false;

  function mostrarAviso(mensagem, erro = false) {
    aviso.textContent = mensagem;
    aviso.classList.toggle('erro', erro);
  }

  function animarSucesso() {
    // a carta "pula"
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
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (enviando) return;

    enviando = true;
    botao.disabled = true;
    textoEnviar.textContent = 'Enviando...';
    mostrarAviso('');

    try {
      const resposta = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (!resposta.ok) {
        // o Formspree devolve os campos com problema em "errors"
        let detalhe = '';
        try {
          const dados = await resposta.json();
          if (dados.errors) detalhe = dados.errors.map((e) => e.message).join(' ');
        } catch (e) {}
        const falha = new Error('resposta');
        falha.detalhe = detalhe;
        throw falha;
      }

      animarSucesso();
      textoEnviar.textContent = 'Mensagem enviada! ✓';
      mostrarAviso('Recebi sua mensagem! Respondo no seu e-mail assim que possível.');
      form.reset();
    } catch (erro) {
      textoEnviar.textContent = 'Tentar de novo';
      if (erro.message === 'resposta') {
        mostrarAviso(
          (erro.detalhe ? erro.detalhe + ' ' : '') +
          'Confira os campos e tente de novo, ou me chame em andrefellipe676@gmail.com.',
          true
        );
      } else {
        mostrarAviso('Parece que você está sem conexão. Verifique a internet e tente de novo, ou me chame em andrefellipe676@gmail.com.', true);
      }
    } finally {
      enviando = false;
      botao.disabled = false;
      setTimeout(() => (textoEnviar.textContent = 'Enviar mensagem →'), 3500);
    }
  });
}

/* ===== Títulos: separar em letras e animar ===== */
function dividirLetras(el) {
  let indice = 0;
  let texto = '';

  function processar(no) {
    [...no.childNodes].forEach((filho) => {
      if (filho.nodeType === 3) {
        const pedaco = document.createDocumentFragment();
        filho.textContent.split(/(\s+)/).forEach((parte) => {
          if (!parte) return;
          if (/^\s+$/.test(parte)) {
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
            s.style.setProperty('--i', indice++);
            palavra.appendChild(s);
          });
          texto += parte;
          pedaco.appendChild(palavra);
        });
        no.replaceChild(pedaco, filho);
      } else if (filho.nodeName === 'BR') {
        texto += ' ';
      } else {
        processar(filho);
      }
    });
  }

  processar(el);
  el.setAttribute('aria-label', texto.trim());
}

document.querySelectorAll('h1, #projetos h2, #diplomas h2, #contato h2, .escrevendo h3').forEach((titulo) => {
  dividirLetras(titulo);
  titulo.classList.add('titulo-anima');
  observador.observe(titulo);
});

/* ===== Foto: parallax 3D suave (mouse e toque) ===== */
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

  const atualizarAlvo = (clientX, clientY) => {
    const r = visual.getBoundingClientRect();
    alvoX = ((clientX - r.left) / r.width - 0.5) * 2;
    alvoY = ((clientY - r.top) / r.height - 0.5) * 2;
    iniciar();
  };

  visual.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' && e.buttons === 0) return;
    atualizarAlvo(e.clientX, e.clientY);
  });
  visual.addEventListener('pointerleave', () => { alvoX = alvoY = 0; iniciar(); });
  visual.addEventListener('pointerup', () => { alvoX = alvoY = 0; iniciar(); });
}

/* ===== Menu mobile (botão hambúrguer) ===== */
const menuToggle = document.getElementById('menu-toggle');
const menu = document.getElementById('menu');

if (menuToggle && menu) {
  function definirMenu(aberto) {
    menu.classList.toggle('active', aberto);
    menuToggle.classList.toggle('aberto', aberto);
    menuToggle.setAttribute('aria-expanded', String(aberto));
    menuToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
  }

  menuToggle.addEventListener('click', () => {
    definirMenu(!menu.classList.contains('active'));
  });

  // fecha ao escolher um link
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => definirMenu(false)));

  // fecha com Esc (e devolve o foco ao botão)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('active')) {
      definirMenu(false);
      menuToggle.focus();
    }
  });

  // se a tela crescer, o menu volta ao normal
  matchMedia('(min-width: 801px)').addEventListener('change', (e) => {
    if (e.matches) definirMenu(false);
  });
}

/* ===== Menu: marca a seção atual ===== */
const linksMenu = document.querySelectorAll('nav a');

const espiao = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      linksMenu.forEach((a) =>
        a.classList.toggle('ativo', a.getAttribute('href') === '#' + entrada.target.id)
      );
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });

linksMenu.forEach((a) => {
  const secao = document.querySelector(a.getAttribute('href'));
  if (secao) espiao.observe(secao);
});


/* ===== Rede de segurança para a foto do hero ===== */
const fotoHero = document.querySelector('.foto img');
if (fotoHero) {
  fotoHero.addEventListener('error', () => {
    fotoHero.style.background = 'repeating-linear-gradient(135deg, #333 0 2px, transparent 2px 12px)';
    fotoHero.removeAttribute('src');
    fotoHero.alt = '';
  });
}

/* ===== Rede de segurança: print de projeto que não carregar ===== */
document.querySelectorAll('.projeto-arte img').forEach((img) => {
  const falhou = () => {
    img.style.display = 'none';
    img.closest('.projeto-arte').style.background =
      'repeating-linear-gradient(135deg, rgba(128,128,128,.25) 0 2px, transparent 2px 14px)';
  };
  img.addEventListener('error', falhou);
  if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) falhou();
});