pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
}
}

rootProject.name = "Sparkling"
include(":app")

// BEGIN SPARKLING AUTOLINK
val sparklingAutolinkProjects = listOf<Pair<String, java.io.File>>(
  // Prefer app-local node_modules (symlink from ensure:native-deps in workspaces);
  // fall back to repo-root hoist path used by npm workspaces.
  "sparkling-navigation" to (
    sequenceOf(
      file("../node_modules/sparkling-navigation/android"),
      file("../../../node_modules/sparkling-navigation/android"),
    ).first { it.exists() }
  )
)
sparklingAutolinkProjects.forEach { (name, dir) ->
    include(":$name")
    project(":$name").projectDir = dir
}
// END SPARKLING AUTOLINK
