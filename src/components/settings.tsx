"use client";

import { CandyButton } from "./motion";
import { useWorkspace } from "@/lib/workspace";
import { Panel, Badge } from "./ui";
import { Icon } from "./icon";
export function Settings({ notify }: { notify: (message: string) => void }) {
  const { workspace, update } = useWorkspace();
  return (
    <div className="max-w-3xl space-y-5">
      <Panel title="Workspace profile" subtitle="Saved in this browser only">
        <form
          className="space-y-5 p-5 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            try {
              update((w) => ({
                ...w,
                settings: {
                  name: String(d.get("name")).trim(),
                  email: String(d.get("email")),
                  language: String(d.get("language")),
                  retention: String(d.get("retention")),
                  notifications: d.has("notifications"),
                  locationConsent: d.has("locationConsent"),
                },
              }));
              notify("Workspace preferences saved locally.");
            } catch {
              notify("Preferences could not be saved.");
            }
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field-label">
              Full name
              <input
                className="input"
                name="name"
                required
                maxLength={80}
                defaultValue={workspace.settings.name}
              />
            </label>
            <label className="field-label">
              Email
              <input
                className="input"
                name="email"
                type="email"
                required
                defaultValue={workspace.settings.email}
              />
            </label>
            <label className="field-label">
              Preferred intervention language
              <select
                className="input"
                name="language"
                defaultValue={workspace.settings.language}
              >
                {["English", "Hindi", "Punjabi", "Marathi", "Telugu"].map(
                  (l) => (
                    <option key={l}>{l}</option>
                  ),
                )}
              </select>
            </label>
            <label className="field-label">
              Requested retention policy
              <select
                className="input"
                name="retention"
                defaultValue={workspace.settings.retention}
              >
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
              </select>
            </label>
          </div>
          <label className="flex items-start gap-3 text-xs">
            <input
              type="checkbox"
              name="notifications"
              defaultChecked={workspace.settings.notifications}
              className="mt-0.5 accent-green"
            />
            <span>
              Enable in-app alert preferences. External delivery requires a
              connected provider.
            </span>
          </label>
          <label className="flex items-start gap-3 text-xs">
            <input
              type="checkbox"
              name="locationConsent"
              defaultChecked={workspace.settings.locationConsent}
              className="mt-0.5 accent-green"
            />
            <span>
              I acknowledge the location-data notice for this demo. No live
              driver location is collected.
            </span>
          </label>
          <p className="text-[11px] leading-5 text-muted">
            Retention is a saved policy preference; automated server-side
            deletion and full interface localization require a production
            backend. This workspace stores demonstration records in your
            browser.
          </p>
          <CandyButton className="button-primary" type="submit">
            Save preferences
            <Icon name="check" size={15} />
          </CandyButton>
        </form>
      </Panel>
      <Panel title="Integration status">
        <div className="divide-y divide-line px-5">
          {[
            "Physical telemetry / MQTT",
            "Hardware ECDSA attestation",
            "Bank escrow / digital rupee",
            "Insurer claim gateway",
            "Regional voice / SMS provider",
          ].map((name) => (
            <div className="flex justify-between py-4 text-xs" key={name}>
              <span>{name}</span>
              <Badge tone="neutral">Not connected</Badge>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
