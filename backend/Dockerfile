# Backend Docker image for the Scala WebSocket server
# Uses the precompiled Scala classes from `out/production/backend`.
# Uses OpenJDK + Coursier to avoid needing authentication for GHCR.

FROM eclipse-temurin:21-jdk

WORKDIR /app

# Install tooling (curl needed for downloading scala runtime)
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Download Scala runtime jars needed for the precompiled classes
RUN mkdir -p /app/lib \
    && curl -fL -o /app/lib/scala3-library_3-3.3.1.jar \
        https://repo1.maven.org/maven2/org/scala-lang/scala3-library_3/3.3.1/scala3-library_3-3.3.1.jar \
    && curl -fL -o /app/lib/scala-library-2.13.12.jar \
        https://repo1.maven.org/maven2/org/scala-lang/scala-library/2.13.12/scala-library-2.13.12.jar

# Copy precompiled classes (compiled by IntelliJ in this repo)
COPY out/production/backend /app/out/production/backend

EXPOSE 80

# Run the JSONServer on port 80 so that it can be reached by ws://<host>/
CMD ["java", "-cp", "out/production/backend:/app/lib/scala3-library_3-3.3.1.jar:/app/lib/scala-library-2.13.12.jar", "algo_backend.JSONServer", "0.0.0.0", "80"]
