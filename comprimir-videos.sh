#!/bin/bash
# Comprime os vídeos do deck para caber no GitHub, sem tocar nos masters.
#
# Por que existe: os originais somavam 881 MB e um deles tinha 312 MB. O GitHub
# bloqueia qualquer arquivo acima de 100 MB, então sem isso o push nem começa.
# O desperdício estava concentrado em arquivos que saíram do editor com bitrate
# de EXPORTAÇÃO (20,9 · 9,9 · 9,4 · 5,7 Mbit/s) em vez de bitrate de entrega.
#
# O que este script NÃO comprime, de propósito:
#   · sede-sao-paulo e sede-novo-hamburgo — já estão em 720×1280 a 1,5–1,8 Mbit/s.
#     Recomprimir só perderia qualidade num cartão de 872×614. Somam 31 MB.
#   · os três depoimentos do Sicredi — saíram do repositório e viraram embed do
#     YouTube (são 22 min de vídeo, 267 MB).
#
# Lê de ../_Assets/Videos-Alta/ e escreve em assets/video/. Rodar duas vezes dá
# o mesmo resultado. Os masters nunca são tocados.
#
#     ./comprimir-videos.sh              # comprime
#     ./comprimir-videos.sh --conferir   # só mostra o que faria

set -euo pipefail

ALTA="../_Assets/Videos-Alta"
DEST="assets/video"
CONFERIR=false
[[ "${1:-}" == "--conferir" ]] && CONFERIR=true

# ffmpeg: usa o do PATH; se não houver, cai no binário estático do imageio-ffmpeg
FF="${FFMPEG:-}"
if [[ -z "$FF" ]]; then
  if command -v ffmpeg >/dev/null; then FF=ffmpeg
  else
    FF=$(python3 -c "import imageio_ffmpeg as i;print(i.get_ffmpeg_exe())" 2>/dev/null || true)
  fi
fi
if [[ -z "$FF" ]] || ! "$FF" -version >/dev/null 2>&1; then
  echo "sem ffmpeg. Duas formas de resolver:"
  echo "    pip3 install --user imageio-ffmpeg     # não mexe no sistema"
  echo "    brew install ffmpeg                    # se preferir o Homebrew"
  exit 1
fi

[[ -d "$ALTA" ]] || { echo "não achei $ALTA — os masters precisam estar lá"; exit 1; }

# só estes entram na compressão; o resto fica como está
ALVOS=(case-magalu case-central-do-corre case-odontoprev
       case-pulando-o-bloco case-sicredi showreel-wtag)
BV=1500k

for nome in "${ALVOS[@]}"; do
  orig="$ALTA/$nome.mp4"; saida="$DEST/$nome.mp4"
  [[ -f "$orig" ]] || { echo "  $nome — sem master, pulando"; continue; }
  antes=$(stat -f%z "$orig")
  if $CONFERIR; then
    printf '  %-26s %7.1f MB → alvo %s\n' "$nome" "$(bc -l <<< "$antes/1048576")" "$BV"
    continue
  fi
  # -vf scale: reduz o LADO MAIOR para 1920 e nunca amplia. Assim serve tanto
  #   para 1920×1080 quanto para os verticais 1080×1920 (o odontoprev é vertical).
  #   -2 mantém a paridade que o H.264 exige.
  # -movflags +faststart: o moov vai para o começo, então o vídeo toca antes de
  #   baixar inteiro — indispensável servindo por HTTP no GitHub Pages.
  "$FF" -nostdin -loglevel error -y -i "$orig" \
    -vf "scale='if(gt(iw,ih),min(1920,iw),-2)':'if(gt(iw,ih),-2,min(1920,ih))'" \
    -c:v libx264 -preset slow -b:v "$BV" -maxrate 2000k -bufsize 4M \
    -profile:v high -level 4.2 -pix_fmt yuv420p \
    -c:a aac -b:a 128k -ac 2 \
    -movflags +faststart "$saida"
  depois=$(stat -f%z "$saida")
  printf '  %-26s %7.1f MB → %6.1f MB  (%.0f%% menor)\n' "$nome" \
    "$(bc -l <<< "$antes/1048576")" "$(bc -l <<< "$depois/1048576")" \
    "$(bc -l <<< "100*(1-$depois/$antes)")"
done

if ! $CONFERIR; then
  echo; echo "assets/video agora:"; du -sh "$DEST"
  echo "acima de 100 MB (o GitHub bloqueia):"
  find "$DEST" -name '*.mp4' -size +100M -print -quit | grep -q . \
    && find "$DEST" -name '*.mp4' -size +100M -exec ls -lh {} \; \
    || echo "  nenhum"
fi
