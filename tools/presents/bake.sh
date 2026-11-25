#!/bin/bash
# Renders the gift box and the presents inside it, and saves them as the
# pictures in public/presents. Only needed after changing scenes.h.
#
#   bash tools/presents/bake.sh      (about 30 minutes, on a fast Mac)
#
#   render.cpp – a small path tracer: light, silk, petals, leaves, foil…
#   scenes.h   – what's modelled: the roses, butterflies, a paper crane, the box…
#   sheets.mjs – puts the renders together into the pictures
set -e
cd "$(dirname "$0")"
RENDERS=${RENDERS:-$(mktemp -d)} # (or a folder of your own)
clang++ -O3 -march=native -ffast-math -std=c++17 render.cpp -o "$RENDERS/render"
render() { "$RENDERS/render" "$@" 2> /dev/null; }

# the box in layers: which part to show, which to leave out, which only cast shadows
BOX="box 900 990 320 0 0"
render $BOX "$RENDERS/front.raw" 1 345
render $BOX "$RENDERS/back.raw" 2 345
render $BOX "$RENDERS/lid.raw" 3 45
render $BOX "$RENDERS/lids.raw" 3 4 5
render $BOX "$RENDERS/fronts.raw" 1 5 43
render $BOX "$RENDERS/band.raw" 4 35
render $BOX "$RENDERS/bow.raw" 5 x
for i in 0 1 2; do render petal 96 96 400 $i 0 "$RENDERS/petal$i.raw"; done
# the roses: those that stay put, then each one that can be picked, lit and
# shaded by the others (which aren't seen)
ROSES="roses 880 726 320 0 0"
render $ROSES "$RENDERS/base.raw" 1 - 23456789ab
for k in 2 3 4 5 6 7 8 9 a b; do
  others=123456789ab
  render roses 880 726 110 0 0 "$RENDERS/pick$k.raw" $k - "${others/$k/}"
  render $ROSES "$RENDERS/alone$k.raw" $k "${others/$k/}" # …and by itself
done
render stem 160 640 200 0 0 "$RENDERS/stem.raw"

# the butterflies: a wing of each kind, their body, and the bed they rest on
for i in 0 1 2; do render wing 270 450 500 $i 0 "$RENDERS/wing$i.raw"; done
render wingbody 120 450 400 0 0 "$RENDERS/wingbody.raw"
render bed 660 545 260 0 0 "$RENDERS/bed.raw"
# the paper crane, beating its wings; and its paper, folding
for i in {0..10}; do render crane 440 380 320 0 $(awk "BEGIN { print -30 + $i * 9.5 }") "$RENDERS/crane$i.raw"; done
for i in {0..6}; do render kite 300 300 260 0 $((i * 30)) "$RENDERS/kite$i.raw"; done

PROJECT="$PWD/../.." node sheets.mjs "$RENDERS" ../../public/presents
echo "The renders are in $RENDERS"
