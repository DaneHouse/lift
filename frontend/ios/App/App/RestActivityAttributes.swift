import Foundation
#if canImport(ActivityKit)
import ActivityKit

/// LIFT: the rest countdown shown as a Live Activity (lock screen + Dynamic Island).
/// Compiled into both the app (RestAlertPlugin starts/updates it) and the RestActivity widget extension.
@available(iOS 16.1, *)
public struct RestActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        /// When the rest ends. The views count down to it on their own, so no updates are needed per second.
        public var endsAt: Date
        /// Set while the rest is paused: the time held, in seconds.
        public var heldSec: Int?
        /// "Rest" / "Paused" or the localised equivalent.
        public var label: String
        /// "Up next · Incline Bench Press · 135 lb × 10", when the app knows it.
        public var next: String

        public init(endsAt: Date, heldSec: Int?, label: String, next: String) {
            self.endsAt = endsAt
            self.heldSec = heldSec
            self.label = label
            self.next = next
        }
    }

    public var startedAt: Date

    public init(startedAt: Date) {
        self.startedAt = startedAt
    }
}
#endif
