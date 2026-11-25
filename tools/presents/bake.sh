#!/bin/bash
# Renders the gift box and the presents inside it, and saves them as the
# pictures in public/presents. Only needed after changing scenes.h.
#
#   bash tools/presents/bake.sh      (about 40 minutes, on a fast Mac)
#
#   render.cpp – a small path tracer: light, silk, petals, leaves, foil…
#   scenes.h   – what's modelled: the roses, butterflies, a paper crane, the box…
#   ribbon.h   – how the box's silk falls, once it's undone
#   sheets.mjs – puts the renders together into the pictures
set -e
cd "$(dirname "$0")"
RENDERS=${RENDERS:-$(mktemp -d)} # (or a folder of your own)
clang++ -O3 -march=native -ffast-math -std=c++17 render.cpp -o "$RENDERS/render"
render() { "$RENDERS/render" "$@" 2> /dev/null; }

# the box in layers: which part to show, which to leave out, which only cast
# shadows (1 front, 2 back, 3 lid, 5 silk, 6 the ground)
BOX="box 900 990"
render $BOX 320 0 0 "$RENDERS/front.raw" 1 356
render $BOX 320 0 0 "$RENDERS/back.raw" 2 356
render $BOX 320 0 0 "$RENDERS/lid.raw" 3 56
render $BOX 320 0 0 "$RENDERS/lids.raw" 3 6 5
render $BOX 320 0 0 "$RENDERS/fronts.raw" 1 56 3
render $BOX 320 0 0 "$RENDERS/fronttied.raw" 1 6 35
render $BOX 320 0 0 "$RENDERS/silk.raw" 5 6
REGION=-180,700,1260,470 render $BOX 320 190 0 "$RENDERS/fallen.raw" 5 6
REGION=0,-200,900,900 render $BOX 320 0 100 "$RENDERS/lidopen.raw" 3 56

# its films: the silk coming undone (58 frames, 30 a second), and the lid opening
# (28, a little past open). The numbers after the sizes are the time in 1/100 s,
# and how far open the lid is in 1/100.
BOX="box 480 528"
SMALL="box 240 264"
for i in {0..57}; do
  t=$(awk "BEGIN { print $i * 100 / 30 }")
  REGION=-96,0,672,608 render $BOX 128 $t 0 "$RENDERS/silk$i.raw" 5 6
  REGION=-48,0,336,304 render $SMALL 300 $t 0 "$RENDERS/shade$i.raw" 13 6 5
  REGION=-48,0,336,304 render $SMALL 200 $t 0 "$RENDERS/floor$i.raw" 6 - 1235
done
REGION=-48,0,336,304 render $SMALL 400 0 0 "$RENDERS/plain.raw" 13 56
REGION=-48,0,336,304 render $SMALL 400 0 0 "$RENDERS/ground.raw" 6 1235
render $SMALL 400 0 0 "$RENDERS/open.raw" 12 356
for i in {0..27}; do
  q=$(awk "BEGIN { print $i * 106 / 27 }")
  REGION=-30,-100,540,640 render $BOX 200 0 $q "$RENDERS/lid$i.raw" 3 56
  render $SMALL 300 0 $q "$RENDERS/lidshade$i.raw" 12 56 3
done
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
