Pod::Spec.new do |s|
  s.name           = 'BackupExclusion'
  s.version        = '1.0.0'
  s.summary        = 'Keeps the app data folder out of iCloud and computer backups.'
  s.description    = 'Sets NSURLIsExcludedFromBackupKey on a folder (PUZZLE STUDIO privacy decision, docs/security/privacy.md).'
  s.author         = 'PUZZLE STUDIO'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.license        = 'UNLICENSED'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = '**/*.swift'
end
