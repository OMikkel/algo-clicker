ThisBuild / scalaVersion := "2.13.12"
ThisBuild / version := "0.1.0"
ThisBuild / organization := "algo-clicker"

lazy val root = (project in file("."))
  .settings(
    name := "algo-backend",
    Compile / mainClass := Some("algo_backend.JSONServer")
  )
