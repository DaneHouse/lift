# LIFT: wires the iOS native pieces into frontend/ios/App/App.xcodeproj (run in CI before archiving;
# idempotent). Uses the xcodeproj gem that CocoaPods already ships with.
#   - RestAlertPlugin.swift/.m + RestActivityAttributes.swift into the App target
#   - a RestActivity widget extension (Live Activity) embedded in the app
require 'xcodeproj'

root = File.expand_path('../../frontend/ios/App', __dir__)
project = Xcodeproj::Project.open(File.join(root, 'App.xcodeproj'))
app = project.targets.find { |t| t.name == 'App' } or abort 'App target missing'
app_group = project.main_group.find_subpath('App', false) or abort 'App group missing'

def add_source(group, target, path)
  ref = group.files.find { |f| f.path == path } || group.new_reference(path)
  target.source_build_phase.add_file_reference(ref, true)
  ref
end

%w[RestAlertPlugin.swift RestAlertPlugin.m RestActivityAttributes.swift].each { |f| add_source(app_group, app, f) }

unless project.targets.any? { |t| t.name == 'RestActivity' }
  ext = project.new_target(:app_extension, 'RestActivity', :ios, '16.2', nil, :swift)
  group = project.main_group.find_subpath('RestActivity', true)
  group.set_source_tree('<group>')
  group.set_path('RestActivity')
  add_source(group, ext, 'RestActivityWidget.swift')
  group.new_reference('Info.plist')
  # The attributes type is shared: the same file compiles into the extension too.
  shared = app_group.files.find { |f| f.path == 'RestActivityAttributes.swift' }
  ext.source_build_phase.add_file_reference(shared, true)
  %w[WidgetKit SwiftUI ActivityKit].each do |fw|
    ref = project.frameworks_group.new_file("System/Library/Frameworks/#{fw}.framework", :sdk_root)
    ext.frameworks_build_phase.add_file_reference(ref, true)
  end
  ext.build_configurations.each do |c|
    s = c.build_settings
    s['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.danehouse.lift.RestActivity'
    s['PRODUCT_NAME'] = '$(TARGET_NAME)'
    s['INFOPLIST_FILE'] = 'RestActivity/Info.plist'
    s['SWIFT_VERSION'] = '5.0'
    s['IPHONEOS_DEPLOYMENT_TARGET'] = '16.2'
    s['TARGETED_DEVICE_FAMILY'] = '1'
    s['CODE_SIGN_STYLE'] = 'Automatic'
    s['MARKETING_VERSION'] = '0.1.0'
    s['CURRENT_PROJECT_VERSION'] = '1'
    s['SKIP_INSTALL'] = 'YES'
    s['GENERATE_INFOPLIST_FILE'] = 'NO'
    s['LD_RUNPATH_SEARCH_PATHS'] = '$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks'
    s['APPLICATION_EXTENSION_API_ONLY'] = 'YES'
  end
  app.add_dependency(ext)
  embed = app.copy_files_build_phases.find { |p| p.name == 'Embed Foundation Extensions' } ||
          app.new_copy_files_build_phase('Embed Foundation Extensions')
  embed.dst_subfolder_spec = '13' # PlugIns
  bf = embed.add_file_reference(ext.product_reference, true)
  bf.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }
end

project.save
puts 'RestActivity wired'
