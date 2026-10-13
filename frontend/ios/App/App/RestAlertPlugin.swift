import Foundation
import Capacitor
import UIKit
import UserNotifications
import AudioToolbox
#if canImport(ActivityKit)
import ActivityKit
#endif

/**
 * LIFT: the rest timer outside the app on iPhone.
 *
 * - A Live Activity (lock screen + Dynamic Island) counts down to the end of the rest. It counts on
 *   its own (Text(timerInterval:)), so the WebView, which iOS freezes in the background, never has
 *   to tick it.
 * - A local notification rings at the end, but only while the app is in the background: in front,
 *   the page plays its own tone, and two at once would double up. Scheduled when the app leaves the
 *   foreground and removed when it comes back.
 *
 * Same method names as Android's RestAlert so lib/rest-alert.js drives both.
 */
@objc(RestAlertPlugin)
public class RestAlertPlugin: CAPPlugin {
    private static let notificationId = "lift-rest-over"
    private var endsAt: Date?
    private var title = "Rest’s over. Next set!"
    private var label = "Rest"
    private var next = ""
    private var sound = true
    private var activityRef: Any?

    override public func load() {
        let nc = NotificationCenter.default
        nc.addObserver(self, selector: #selector(didEnterBackground), name: UIApplication.didEnterBackgroundNotification, object: nil)
        nc.addObserver(self, selector: #selector(willEnterForeground), name: UIApplication.willEnterForegroundNotification, object: nil)
    }

    // MARK: JS API

    @objc func schedule(_ call: CAPPluginCall) {
        guard let at = call.getDouble("at") else { call.reject("at is required"); return }
        let end = Date(timeIntervalSince1970: at / 1000)
        guard end > Date() else { call.reject("at must be in the future"); return }
        endsAt = end
        title = call.getString("title") ?? title
        label = call.getString("countdownTitle") ?? "Rest"
        sound = call.getBool("sound") ?? true
        if let n = call.getString("next") { next = n }
        DispatchQueue.main.async {
            if UIApplication.shared.applicationState != .active { self.scheduleNotification() }
            self.showActivity(heldSec: nil)
        }
        call.resolve(["kind": "ios"])
    }

    @objc func cancel(_ call: CAPPluginCall) {
        endsAt = nil
        removeNotification()
        endActivity()
        call.resolve()
    }

    @objc func hold(_ call: CAPPluginCall) {
        let leftMs = call.getDouble("leftMs") ?? 0
        endsAt = nil
        removeNotification()
        label = call.getString("label") ?? "Paused"
        DispatchQueue.main.async { self.showActivity(heldSec: Int((leftMs / 1000).rounded())) }
        call.resolve()
    }

    @objc func buzz(_ call: CAPPluginCall) {
        AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
        call.resolve()
    }

    @objc func setAccent(_ call: CAPPluginCall) { call.resolve() }

    /// The "Up next" line, sent whenever it changes during a rest.
    @objc func setNext(_ call: CAPPluginCall) {
        next = call.getString("next") ?? ""
        DispatchQueue.main.async { if self.endsAt != nil { self.showActivity(heldSec: nil) } }
        call.resolve()
    }

    @objc func requestPermission(_ call: CAPPluginCall) {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { granted, _ in
            call.resolve(["granted": granted])
        }
    }

    // MARK: App state

    @objc private func didEnterBackground() { scheduleNotification() }
    @objc private func willEnterForeground() { removeNotification() }

    // MARK: Notification

    private func scheduleNotification() {
        guard let end = endsAt else { return }
        let interval = end.timeIntervalSinceNow
        guard interval > 0.5 else { return }
        let content = UNMutableNotificationContent()
        content.title = title
        if !next.isEmpty { content.body = next }
        if sound { content.sound = .default }
        if #available(iOS 15.0, *) { content.interruptionLevel = .timeSensitive }
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: interval, repeats: false)
        let req = UNNotificationRequest(identifier: Self.notificationId, content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(req, withCompletionHandler: nil)
    }

    private func removeNotification() {
        let c = UNUserNotificationCenter.current()
        c.removePendingNotificationRequests(withIdentifiers: [Self.notificationId])
        c.removeDeliveredNotifications(withIdentifiers: [Self.notificationId])
    }

    // MARK: Live Activity

    private func showActivity(heldSec: Int?) {
        #if canImport(ActivityKit)
        if #available(iOS 16.2, *) {
            guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }
            let target = heldSec != nil ? Date().addingTimeInterval(TimeInterval(heldSec!)) : (endsAt ?? Date())
            let state = RestActivityAttributes.ContentState(endsAt: target, heldSec: heldSec, label: label, next: next)
            let content = ActivityContent(state: state, staleDate: target.addingTimeInterval(60))
            if let activity = activityRef as? Activity<RestActivityAttributes> {
                Task { await activity.update(content) }
            } else {
                // One rest activity at a time: a leftover from a crash or an older launch goes first.
                for old in Activity<RestActivityAttributes>.activities {
                    Task { await old.end(nil, dismissalPolicy: .immediate) }
                }
                activityRef = try? Activity.request(attributes: RestActivityAttributes(startedAt: Date()), content: content, pushType: nil)
            }
        }
        #endif
    }

    private func endActivity() {
        #if canImport(ActivityKit)
        if #available(iOS 16.2, *) {
            let mine = activityRef as? Activity<RestActivityAttributes>
            activityRef = nil
            for a in Activity<RestActivityAttributes>.activities where mine == nil || a.id == mine!.id {
                Task { await a.end(nil, dismissalPolicy: .immediate) }
            }
        }
        #endif
    }
}
