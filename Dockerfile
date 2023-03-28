FROM openjdk:8
VOLUME /tmp
EXPOSE 5080
ARG JAR_FILE=target\bb-ux.war
ADD bb-ux.war app.war
ENTRYPOINT ["java","-jar","/app.war"]
