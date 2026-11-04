import ExpoModulesCore
import Foundation

/// Keeps a folder (and everything in it) out of iCloud and computer backups.
/// Apple: "excluding a directory also excludes its contents"; the flag survives app updates.
public class BackupExclusionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BackupExclusion")

    /// Accepts a file:// URI or a plain path. Returns whether the folder is now excluded.
    AsyncFunction("excludeFromBackup") { (uri: String) throws -> Bool in
      guard var url = uri.hasPrefix("file://") ? URL(string: uri) : URL(fileURLWithPath: uri) else {
        throw Exception(name: "InvalidPath", description: "Not a file URL")
      }
      var values = URLResourceValues()
      values.isExcludedFromBackup = true
      try url.setResourceValues(values)
      url.removeAllCachedResourceValues()
      return try url.resourceValues(forKeys: [.isExcludedFromBackupKey]).isExcludedFromBackup ?? false
    }
  }
}
