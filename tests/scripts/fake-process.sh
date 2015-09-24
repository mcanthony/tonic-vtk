#!/bin/bash

echo "Start process"

COUNTER=0
while [  $COUNTER -lt 10 ]; do
    sleep 1
    echo "Working... $COUNTER"
    let COUNTER=COUNTER+1
done

echo "Done"
