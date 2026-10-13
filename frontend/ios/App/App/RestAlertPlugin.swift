import Foundation
import Capacitor
import UIKit
import UserNotifications
import AudioToolbox
import AVFoundation
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
    private var cuePlayer: AVAudioPlayer?
    private var cueDelegate: CueDelegate?

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

    /// The end-of-rest tone, rendered from the same note list the page uses (lib/rest-sounds.js),
    /// played with other audio ducked, then the session is released so the music comes back up.
    @objc func cue(_ call: CAPPluginCall) {
        let notes = (call.getArray("notes") as? [[Double]]) ?? [[1319, 0.16, 0], [988, 0.16, 0.22], [1319, 0.5, 0.44]]
        let peak = call.getDouble("peak") ?? 0.6
        DispatchQueue.main.async {
            let session = AVAudioSession.sharedInstance()
            do {
                try session.setCategory(.playback, mode: .default, options: [.duckOthers])
                try session.setActive(true)
                let player = try AVAudioPlayer(data: Self.renderWav(notes: notes, peak: peak))
                let delegate = CueDelegate { [weak self] in
                    try? session.setActive(false, options: .notifyOthersOnDeactivation)
                    // Back to the WebView's usual mixing so the page's own sounds never interrupt music.
                    try? session.setCategory(.ambient, mode: .default, options: [.mixWithOthers])
                    self?.cuePlayer = nil
                    self?.cueDelegate = nil
                }
                player.delegate = delegate
                self.cueDelegate = delegate
                self.cuePlayer = player
                player.play()
                call.resolve()
            } catch {
                call.reject("cue failed")
            }
        }
    }

    /// 16-bit mono WAV of sine notes [freq, seconds, startSeconds, glideTo?] with a short attack and a decay.
    static func renderWav(notes: [[Double]], peak: Double) -> Data {
        let rate = 44100.0
        let end = notes.map { ($0.count > 2 ? $0[2] : 0) + ($0.count > 1 ? $0[1] : 0.2) }.max() ?? 0.5
        let count = Int((end + 0.15) * rate)
        var samples = [Double](repeating: 0, count: count)
        for n in notes {
            guard n.count >= 2 else { continue }
            let f0 = n[0], dur = n[1], start = n.count > 2 ? n[2] : 0, f1 = n.count > 3 ? n[3] : n[0]
            let s0 = Int(start * rate), len = Int(dur * rate)
            var phase = 0.0
            for i in 0..<len where s0 + i < count {
                let t = Double(i) / rate
                let f = f0 + (f1 - f0) * (t / max(dur, 0.001))
                phase += 2 * Double.pi * f / rate
                let attack = min(1, t / 0.01)
                let decay = exp(-3.0 * t / max(dur, 0.05))
                samples[s0 + i] += sin(phase) * attack * decay * peak * 0.6
            }
        }
        var data = Data()
        func u32(_ v: UInt32) { var x = v.littleEndian; data.append(Data(bytes: &x, count: 4)) }
        func u16(_ v: UInt16) { var x = v.littleEndian; data.append(Data(bytes: &x, count: 2)) }
        data.append("RIFF".data(using: .ascii)!); u32(UInt32(36 + count * 2))
        data.append("WAVE".data(using: .ascii)!)
        data.append("fmt ".data(using: .ascii)!); u32(16); u16(1); u16(1); u32(UInt32(rate)); u32(UInt32(rate) * 2); u16(2); u16(16)
        data.append("data".data(using: .ascii)!); u32(UInt32(count * 2))
        for s in samples { u16(UInt16(bitPattern: Int16(max(-1, min(1, s)) * 32767))) }
        return data
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

final class CueDelegate: NSObject, AVAudioPlayerDelegate {
    private let done: () -> Void
    init(_ done: @escaping () -> Void) { self.done = done }
    func audioPlayerDidFinishPlaying(_ player: AVAudioPlayer, successfully flag: Bool) { done() }
    func audioPlayerDecodeErrorDidOccur(_ player: AVAudioPlayer, error: Error?) { done() }
}
