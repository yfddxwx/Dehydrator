@echo off
chcp 65001 >nul
title 脱水启动

echo ===================================================
echo   CYBERDYNE MIL-SPEC MODEL-84 终端正在启动...
echo ===================================================
echo.
echo 正在启动本地服务器并自动打开浏览器，请稍候...
echo.

:: 启动浏览器打开本地地址
start http://localhost:5173/

:: 运行 Vite 本地服务
npm run dev

pause
