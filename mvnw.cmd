@ECHO OFF
SETLOCAL
set MAVEN_PROJECTBASEDIR=%~dp0
set MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%

if "%JAVA_HOME%"=="" (
  set JAVA_EXEC=java
) else (
  set JAVA_EXEC=%JAVA_HOME%\bin\java
)

"%JAVA_EXEC%" -classpath "%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar" -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
