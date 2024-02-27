#!/bin/bash
git clone https://github.com/Deblok-Workshop/Wordlists
sleep 1 # It will not work without this
if [ "$1" != "--minimal" ]; then
bash ./Wordlists/rockyou.sh --gunzip
cp rockyou.txt ./Wordlists/rockyou.txt
rm -rf rockyou.txt
fi
cp ./Wordlists/*.txt ../server/modules/wordlists/
sleep 1
rm -rf ./Wordlists
sleep 1 
echo Done!
                                                                                                   