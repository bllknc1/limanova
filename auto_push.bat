@echo off
echo ========================================
echo   Limanova Auto-Push Aktif!
echo   Her 60 saniyede GitHub'a gonderilecek.
echo   Durdurmak icin bu pencereyi kapatin.
echo ========================================
echo.

:loop
cd /d C:\Users\UNLOST\Desktop\limanova
git add .
git diff --cached --quiet
if errorlevel 1 (
    for /f "tokens=1-5 delims=/:. " %%a in ("%date% %time%") do set dt=%%a-%%b-%%c_%%d-%%e
    git commit -m "Otomatik guncelleme - %date% %time%"
    git push origin main
    echo [%date% %time%] Degisiklikler GitHub'a gonderildi!
) else (
    echo [%date% %time%] Degisiklik yok, bekleniyor...
)
timeout /t 60 /nobreak >nul
goto loop
