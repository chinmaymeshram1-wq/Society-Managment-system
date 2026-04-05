@echo off
echo Starting Rahul Downtown Society Server...
echo Please leave this window open!
start http://127.0.0.1:8000
python -m http.server 8000
