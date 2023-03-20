@ECHO OFF

@SET INSTALL_HOME_64=C:\Users\Upendra\Documents\bb

@SET NODE_HOME=%INSTALL_HOME_64%\node-v18.15.0-win-x64

@SET ANGULAR_APP_HOME=%INSTALL_HOME_64%\bb_ux\src\main\root\

IF NOT EXIST "%ANGULAR_APP_HOME%" @(
	ECHO Application root folder doesn't exist - "%ANGULAR_APP_HOME%".

	cd "%INSTALL_HOME_64%"

	@GOTO :EOF
)

IF EXIST "%ANGULAR_APP_HOME%" @(
	ECHO Started - Installing required node modules for bb-ux.
	
	cd "%ANGULAR_APP_HOME%"

	call %NODE_HOME%\npm install --save typescript@3.2.4

	call %NODE_HOME%\npm install -g @angular/cli@7.3.5

	call %NODE_HOME%\npm install --save typescript@3.2.4

	call %NODE_HOME%\npm install -g @angular/cli@7.3.5

	call %NODE_HOME%\npm uninstall --save-dev angular-cli

	call %NODE_HOME%\npm install --save-dev @angular/cli@7.3.5

	call %NODE_HOME%\npm install --save @angular/core 7.2.8 @angular/compiler-cli@7.2.8 @angular/http@7.2.8 @angular/common@7.2.8 @angular/animations@7.2.8

	call %NODE_HOME%\npm install --save @angular/material@7.3.3 @angular/cdk@7.3.3

	call %NODE_HOME%\npm install --save @angular/flex-layout@7.0.0-beta.23 angular-web-storage@4.1.0

	call %NODE_HOME%\npm install --save ngx-loading@3.0.1 hammerjs@2.0.8 socket.io@2.2.0

	cd "%INSTALL_HOME_64%"

	ECHO Completed - Installing required node modules for bb-ux.
)

GOTO :EOF