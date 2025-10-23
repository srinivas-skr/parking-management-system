@echo off
echo ===============================================
echo    Making Slots Available for Testing
echo ===============================================
echo.

curl -X PUT http://localhost:8080/api/slots/1/status?status=AVAILABLE -H "Content-Type: application/json"
curl -X PUT http://localhost:8080/api/slots/2/status?status=AVAILABLE -H "Content-Type: application/json"
curl -X PUT http://localhost:8080/api/slots/3/status?status=AVAILABLE -H "Content-Type: application/json"
curl -X PUT http://localhost:8080/api/slots/4/status?status=AVAILABLE -H "Content-Type: application/json"
curl -X PUT http://localhost:8080/api/slots/5/status?status=AVAILABLE -H "Content-Type: application/json"
curl -X PUT http://localhost:8080/api/slots/6/status?status=AVAILABLE -H "Content-Type: application/json"
curl -X PUT http://localhost:8080/api/slots/7/status?status=AVAILABLE -H "Content-Type: application/json"
curl -X PUT http://localhost:8080/api/slots/8/status?status=AVAILABLE -H "Content-Type: application/json"
curl -X PUT http://localhost:8080/api/slots/9/status?status=AVAILABLE -H "Content-Type: application/json"
curl -X PUT http://localhost:8080/api/slots/10/status?status=AVAILABLE -H "Content-Type: application/json"

echo.
echo ===============================================
echo    10 Slots Now Available!
echo ===============================================
echo    Refresh your browser: http://localhost:5173
echo ===============================================
pause
