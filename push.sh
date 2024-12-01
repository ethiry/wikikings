#!/bin/sh

CSVFOLDER=$1
if [ -z "$CSVFOLDER" ]
then
  echo "example: $0 path/to/scvFIles/"
  exit
fi

OPTIONS="-av --exclude=.DS_Store --delete-excluded --delete-after"

DESTINATION="~/travelphotos/assets/wikikings/"

set -x #echo on

rsync $OPTIONS $CSVFOLDER/*.csv VPS:$DESTINATION

set -x #echo off