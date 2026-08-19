# WT.AG · Credenciais 2026

Apresentação de credenciais da WT.AG em HTML, 26 slides, palco fixo de 1920×1080
escalado para caber na janela. Sem build, sem dependência: é abrir o
`index.html` no navegador.

```bash
open index.html
```

Funciona por `file://` (offline) e servida por HTTP. Três vídeos vêm do YouTube e
esses precisam de internet — ver [Vídeos](#vídeos).

## Como navegar

| tecla | ação |
|---|---|
| `→` `←` `espaço` | avança e volta |
| `S` | sumário |
| `Esc` | fecha player, sumário ou painel de texto |
| `F` | tela cheia, com o player aberto |

Nos slides de case: clique na mídia para abrir o player, em `＋ Texto completo`
para o texto integral, e na pílula **Clientes** no topo para ir às marcas
parceiras. No slide de marcas parceiras, passar o mouse num logo que tem case
mostra uma prévia.

## Estrutura

```
index.html              o deck — os 26 slides
index_review.html       GERADO. não edite: sai do index.html
gerar-review.py         gera o de cima, com a camada de comentários
comprimir-videos.sh     recomprime os vídeos a partir dos masters
css/deck.css            todo o visual
css/review.css          camada de revisão
js/deck.js              navegação, player, animações
js/review.js            camada de revisão
assets/
  img/                  fotos, logos, selos
  video/                8 vídeos, 143 MB
  fonts/                Special Gothic Condensed One + Geist
  logo/                 marcas WT.AG e Grupo WE
  logos-imprensa/       acervo de prêmios e veículos, com originais
```

## A regra que mais dá dor de cabeça

`deck.css` e `deck.js` entram com `?v=NN` no `index.html`. **Toda vez que você
mexer no CSS ou no JS, suba esse número.** Sem isso o navegador serve a versão
velha do cache e parece que a alteração não funcionou — já custou horas de
depuração de um bug que não existia.

```bash
sed -i '' 's/?v=108/?v=109/g' index.html && python3 gerar-review.py
```

## Modo revisão

O `index_review.html` é o deck com uma camada de comentários por cima: arraste
sobre o slide para marcar uma área, escreva, e exporte em Markdown ou JSON. As
marcações ficam no `localStorage` do navegador, então **exporte antes de trocar
de máquina ou limpar o navegador.**

```bash
python3 gerar-review.py              # os 26 slides
python3 gerar-review.py --variantes  # anexa também as variantes de layout
```

O gerador confere a estrutura dos cases a cada execução e acusa se algum perder
um bloco — existe porque uma edição por regex já apagou três miniaturas de vídeo
sem que nenhuma outra validação percebesse.

## Vídeos

Oito arquivos, 143 MB, todos abaixo de 24 MB. Vieram de masters que somavam
881 MB: o `case-sicredi.mp4` tinha 312 MB porque saiu do editor a 20,9 Mbit/s,
bitrate de exportação e não de entrega.

Os masters em resolução cheia **não estão neste repositório**. Ficam no Drive, em
`_Assets/Videos-Alta/`, com um LEIA-ME explicando cada decisão. Para recomprimir:

```bash
./comprimir-videos.sh --conferir
./comprimir-videos.sh
```

**Três vídeos vêm do YouTube** — os depoimentos do Sicredi, que somavam 22
minutos e 267 MB. Eles são os únicos que precisam de internet.

## Publicando no GitHub Pages

O deck é estático, então Pages serve direto do branch. Em **Settings → Pages**,
escolha o branch `main` e a raiz `/`. Nada a construir.

Um detalhe: o `.nojekyll` na raiz impede o Jekyll de processar o site. Sem ele,
qualquer pasta que comece com `_` (como `_originais/` dentro de
`assets/logos-imprensa/`) é ignorada na publicação e os arquivos não aparecem.

## Pendências de conteúdo

- Logo do **Marcas Mais**, o único veículo de imprensa que falta. Aparece em 4
  dos 5 cases; enquanto não chega, o item simplesmente não entra no rodapé.
- **Números do Odontoprev** — três dos seis espaços mostram `(nº)`.
- **URLs de LinkedIn** do time. O selo só aparece em quem tem URL declarada.
- **Foto do slide 11**, marcada `(Foto a trocar)`.
- Reexportar o **master do Magalu**: tem 873 erros de decodificação de origem.
