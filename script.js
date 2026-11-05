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
    setTimeout(() => intro.remove(), 1000);        // tira do HTML depois
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

/* ===== Cards de projeto inclinam com o mouse ===== */
document.querySelectorAll('.projeto').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const rotY = ((e.clientX - r.left) / r.width - 0.5) * 12;
    const rotX = ((e.clientY - r.top) / r.height - 0.5) * -12;
    card.style.transform =
      `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', () => (card.style.transform = ''));
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
    ], { duration: 900, easing: 'ease-in-out' });

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

/* ===== Foto: efeito 3D seguindo o mouse ===== */
const visual = document.querySelector('.hero-visual');

if (visual) {
  visual.addEventListener('mousemove', (e) => {
    const r = visual.getBoundingClientRect();
    visual.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5) * 2);
    visual.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5) * 2);
  });
  visual.addEventListener('mouseleave', () => {
    visual.style.setProperty('--px', 0);
    visual.style.setProperty('--py', 0);
  });
}