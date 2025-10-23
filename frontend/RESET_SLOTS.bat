@echo off
echo.
echo ====================================
echo   RESET PARKING SLOTS TO AVAILABLE
echo ====================================
echo.

REM Get the directory of this script
set "SCRIPT_DIR=%~dp0"

REM Create SQL file
echo UPDATE PARKING_SLOTS SET SLOT_STATUS = 'AVAILABLE' WHERE SLOT_STATUS = 'OCCUPIED'; > "%SCRIPT_DIR%reset-slots.sql"

echo ✅ Created reset-slots.sql
echo.
echo 📝 Instructions:
echo.
echo 1. Open: http://localhost:8080/h2-console
echo 2. Login with:
echo    - JDBC URL: jdbc:h2:mem:parkingdb
echo    - Username: sa
echo    - Password: (leave blank)
echo 3. Run this SQL:
echo.
echo    UPDATE PARKING_SLOTS SET SLOT_STATUS = 'AVAILABLE';
echo.
echo 4. Refresh your dashboard!
echo.
echo ====================================
echo.

pause
