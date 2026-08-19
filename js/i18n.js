/* ============================================================================
   TRADUÇÃO PT ⇄ EN
   ============================================================================
   O dicionário é indexado pelo texto EM PORTUGUÊS, que é o que está escrito no
   index.html. Isso mantém o HTML legível e sem chaves inventadas: o português
   continua sendo a fonte, e o inglês é a tradução dele.

   Como a troca acontece
   ---------------------
   Na primeira troca cada elemento guarda o original em `data-pt` (ou
   `data-pt-<attr>`), e voltar para português é reler dali. Nada é reconstruído
   a partir do dicionário no sentido inverso, então uma tradução ambígua nunca
   corrompe o texto original.

   Casamento em dois níveis, nesta ordem:
     1. innerHTML inteiro — pega os casos com marcação por dentro, como
        "…um <i>framework</i> em 8 etapas…"
     2. elemento-folha, pelo textContent
   Sem isso, um elemento com <i> ou <br> dentro seria reescrito em texto puro e
   perderia a marcação.

   Tipografia posicionada à mão
   ----------------------------
   Os slides de lettering têm --x e --fs calculados na métrica da fonte para a
   palavra em português. Em inglês a palavra tem outra largura, então o mesmo --x
   deixa de centrar e o mesmo --fs deixa de encostar na margem. Por isso as
   linhas traduzidas trazem também `data-en-x` e `data-en-fs`, medidos do mesmo
   jeito. Ver `medir-lettering.js` para como esses números saíram.
   ========================================================================= */
(function () {
  'use strict';

  var ATTRS = ['data-titulo', 'data-legenda', 'data-texto', 'title',
               'aria-label', 'alt', 'placeholder'];
  var VARS  = [['data-en-x', '--x'], ['data-en-fs', '--fs'], ['data-en-cap', '--cap']];

  var raiz = document.getElementById('viewport') || document.body;
  var idioma = 'pt';

  function traduzir(txt) {
    if (txt == null) return null;
    var k = txt.trim();
    if (!k) return null;
    var v = window.DIC_EN && window.DIC_EN[k];
    return (v === undefined || v === null || v === k) ? null : v;
  }

  /* Guarda o original uma única vez. Na volta ao português é isto que vale. */
  function guardar(el, chave, valor) {
    if (!el.hasAttribute(chave)) el.setAttribute(chave, valor);
  }

  function aplicar(para) {
    var els = raiz.querySelectorAll('*');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;

      /* ── conteúdo ── */
      if (para === 'en') {
        var alvo = traduzir(el.innerHTML);
        if (alvo !== null) {
          guardar(el, 'data-pt', el.innerHTML);
          el.innerHTML = alvo;
        } else if (!el.children.length) {
          var t = traduzir(el.textContent);
          if (t !== null) {
            guardar(el, 'data-pt', el.innerHTML);
            el.innerHTML = t;
          }
        }
      } else if (el.hasAttribute('data-pt')) {
        el.innerHTML = el.getAttribute('data-pt');
      }

      /* ── atributos que o usuário vê ── */
      for (var a = 0; a < ATTRS.length; a++) {
        var nome = ATTRS[a], guarda = 'data-pt-' + nome.replace(/^data-/, '');
        if (para === 'en') {
          if (!el.hasAttribute(nome)) continue;
          var tv = traduzir(el.getAttribute(nome));
          if (tv !== null) {
            guardar(el, guarda, el.getAttribute(nome));
            el.setAttribute(nome, tv);
          }
        } else if (el.hasAttribute(guarda)) {
          el.setAttribute(nome, el.getAttribute(guarda));
        }
      }

      /* ── geometria do lettering ── */
      for (var v = 0; v < VARS.length; v++) {
        var attr = VARS[v][0], cssVar = VARS[v][1];
        if (!el.hasAttribute(attr)) continue;
        var guardaV = 'data-pt-' + cssVar.replace('--', '');
        if (para === 'en') {
          guardar(el, guardaV, el.style.getPropertyValue(cssVar));
          el.style.setProperty(cssVar, el.getAttribute(attr));
        } else if (el.hasAttribute(guardaV)) {
          el.style.setProperty(cssVar, el.getAttribute(guardaV));
        }
      }
    }

    document.documentElement.lang = (para === 'en') ? 'en' : 'pt-BR';
    idioma = para;
    try { localStorage.setItem('wtag-idioma', para); } catch (e) {}
    atualizarBotao();
    /* O sumário é montado a partir dos data-titulo, então precisa ser refeito. */
    if (window.DECK && window.DECK.remontarSumario) window.DECK.remontarSumario();
    document.dispatchEvent(new CustomEvent('idiomamudou', { detail: { idioma: para } }));
  }

  /* ── botão ─────────────────────────────────────────────────────────────── */
  var btn;
  function atualizarBotao() {
    if (!btn) return;
    btn.setAttribute('aria-label',
      idioma === 'pt' ? 'Switch to English' : 'Mudar para português');
    btn.title = btn.getAttribute('aria-label');
    var ps = btn.querySelector('[data-lg="pt"]'), es = btn.querySelector('[data-lg="en"]');
    ps.classList.toggle('is-on', idioma === 'pt');
    es.classList.toggle('is-on', idioma === 'en');
  }

  function montarBotao() {
    var ui = document.getElementById('ui');
    if (!ui) return;
    btn = document.createElement('button');
    btn.className = 'lg';
    btn.type = 'button';
    btn.setAttribute('data-nonav', '');
    btn.innerHTML = '<span data-lg="pt">PT</span><i></i><span data-lg="en">EN</span>';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      aplicar(idioma === 'pt' ? 'en' : 'pt');
    });
    ui.appendChild(btn);
    atualizarBotao();
  }

  function iniciar() {
    montarBotao();
    var salvo = null;
    try { salvo = localStorage.getItem('wtag-idioma'); } catch (e) {}
    if (salvo === 'en') aplicar('en');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else { iniciar(); }

  window.I18N = { aplicar: aplicar, idioma: function () { return idioma; } };
})();
