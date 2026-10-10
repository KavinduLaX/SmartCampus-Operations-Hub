#!/bin/sh

MAVEN_PROJECTBASEDIR="$(cd "$(dirname "$0")"; pwd -P)"
MAVEN_WRAPPER_JAR="$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.jar"

JAVA_EXEC="$JAVA_HOME/bin/java"
if [ ! -x "$JAVA_EXEC" ]; then
  JAVA_EXEC="java"
fi

exec "$JAVA_EXEC" -classpath "$MAVEN_WRAPPER_JAR" -Dmaven.multiModuleProjectDirectory="$MAVEN_PROJECTBASEDIR" org.apache.maven.wrapper.MavenWrapperMain "$@"
