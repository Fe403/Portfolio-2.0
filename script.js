// Efeito de rotação nos cards dos projetos
const cards = document.querySelectorAll('.projeto');

cards.forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();   
    const x = e.clientX - r.left;            
    const y = e.clientY - r.top;              

    const rotY = (x / r.width - 0.5) * 12;    
    const rotX = (y / r.height - 0.5) * -12;

    card.style.transform =
      `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';                
  });
});

/* ===== Tema escuro / claro ===== */
const botaoTema = document.getElementById('tema');
const textoTema = document.getElementById('tema-texto');

function aplicarTema(claro) {
  document.body.classList.toggle('claro', claro);
  textoTema.textContent = claro ? 'Preto' : 'Branco';
  localStorage.setItem('tema', claro ? 'claro' : 'escuro');
}

// ao abrir a página, usa o tema que a pessoa escolheu da última vez
aplicarTema(localStorage.getItem('tema') === 'claro');

botaoTema.addEventListener('click', () => {
  aplicarTema(!document.body.classList.contains('claro'));
});

/* ===== Animação de clique em todos os botões ===== */
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

/* ===== Formulário (feedback ao enviar) ===== */
const form = document.querySelector('form');
const textoEnviar = form.querySelector('button span');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  textoEnviar.textContent = 'Mensagem enviada! ✓';
  form.reset();
  setTimeout(() => (textoEnviar.textContent = 'Enviar mensagem →'), 3000);
});

/* ===== Cards de projeto inclinam com o mouse ===== */
document.querySelectorAll('.projeto').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rotY = (x / r.width - 0.5) * 12;
    const rotX = (y / r.height - 0.5) * -12;
    card.style.transform =
      `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', () => (card.style.transform = ''));
});