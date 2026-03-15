# Build stage: compile the Scala backend
FROM sbtscala/scala-sbt:graalvm-ce-22.3.3-b1-java17_1.12.5_3.8.2 AS build

WORKDIR /app

# Copy build config first for better cache behavior
COPY build.sbt project/ ./
COPY src ./src

# Package the application into a jar
RUN sbt -no-colors package

# Runtime stage: run the compiled backend
FROM  openjdk:26-ea-17-trixie AS runtime

WORKDIR /app

# Copy the packaged jar from the build stage
COPY --from=build /app/target/scala-2.13/algo-backend_2.13-0.1.0.jar ./app.jar

EXPOSE 8080

# Listen on 0.0.0.0 so the container can be reached from outside
CMD ["java", "-jar", "app.jar", "0.0.0.0", "8080"]
