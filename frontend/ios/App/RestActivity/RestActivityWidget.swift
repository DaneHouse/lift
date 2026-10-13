import ActivityKit
import SwiftUI
import WidgetKit

// LIFT: the rest countdown on the lock screen and in the Dynamic Island. Monochrome, like the app.
@main
struct RestActivityBundle: WidgetBundle {
    var body: some Widget { RestActivityWidget() }
}

struct RestActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: RestActivityAttributes.self) { context in
            LockScreenView(state: context.state)
                .activityBackgroundTint(Color.black)
                .activitySystemActionForegroundColor(Color.white)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.state.label.uppercased())
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(.secondary)
                        .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Countdown(state: context.state)
                        .font(.title2.weight(.semibold).monospacedDigit())
                        .frame(maxWidth: 90, alignment: .trailing)
                        .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    if !context.state.next.isEmpty {
                        Text(context.state.next)
                            .font(.subheadline)
                            .lineLimit(1)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, 4)
                    }
                }
            } compactLeading: {
                Image(systemName: "timer")
            } compactTrailing: {
                Countdown(state: context.state)
                    .monospacedDigit()
                    .frame(maxWidth: 46)
            } minimal: {
                Image(systemName: "timer")
            }
        }
    }
}

struct Countdown: View {
    let state: RestActivityAttributes.ContentState
    var body: some View {
        if let held = state.heldSec {
            Text(String(format: "%d:%02d", held / 60, held % 60))
        } else {
            Text(timerInterval: Date()...max(Date(), state.endsAt), countsDown: true)
                .multilineTextAlignment(.trailing)
        }
    }
}

struct LockScreenView: View {
    let state: RestActivityAttributes.ContentState
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .firstTextBaseline) {
                Text(state.label.uppercased())
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.6))
                Spacer()
                Countdown(state: state)
                    .font(.system(size: 34, weight: .semibold).monospacedDigit())
                    .foregroundStyle(.white)
            }
            if !state.next.isEmpty {
                Text(state.next)
                    .font(.subheadline)
                    .foregroundStyle(.white.opacity(0.85))
                    .lineLimit(1)
            }
        }
        .padding(16)
    }
}
