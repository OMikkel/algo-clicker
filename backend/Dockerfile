# Build stage: compile the Scala backend
FROM sbtscala/scala-sbt:eclipse-temurin-alpine-21.0.8_9_1.12.4_3.8.1 AS build

WORKDIR /app

# Copy build config first for better cache behavior
COPY project ./project
COPY src ./src

# Create a minimal sbt build for this source layout and compile once in build stage.
RUN printf '%s\n' \
	'ThisBuild / scalaVersion := "3.3.3"' \
	'' \
	'lazy val root = (project in file("."))' \
	'  .settings(' \
	'    name := "algo-clicker-backend",' \
	'    Compile / unmanagedSourceDirectories += baseDirectory.value / "src",' \
	'    Compile / mainClass := Some("algo_backend.JSONServer")' \
	'  )' > /app/build.sbt && \
	sbt compile

# Runtime stage: run the compiled backend
FROM sbtscala/scala-sbt:eclipse-temurin-alpine-21.0.8_9_1.12.4_3.8.1 AS runtime

WORKDIR /app

# Copy project sources and generated build config from the build stage.
COPY --from=build /app /app

EXPOSE 8081

# Listen on 0.0.0.0 so the container can be reached from outside
CMD ["sbt", "runMain algo_backend.JSONServer 0.0.0.0 8081"]
