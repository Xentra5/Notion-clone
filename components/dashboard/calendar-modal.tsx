"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, X, Check, ExternalLink } from "lucide-react";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarModal({ isOpen, onClose }: CalendarModalProps) {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#202020] border border-[#333333] rounded-2xl shadow-2xl overflow-hidden text-[#d4d4d4]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2d2d2d] flex items-center justify-between bg-[#191919]">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <div className="h-6 w-6 rounded bg-[#0078df] flex items-center justify-center">
              <CalendarIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <span>Connect your calendar</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#888888] hover:text-white hover:bg-[#2c2c2c] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs sm:text-sm">
          <p className="text-[#a3a3a3] leading-relaxed">
            Sync your Google or Outlook Calendar with Notion to see upcoming events directly in your workspace and auto-generate meeting notes.
          </p>

          <div className="space-y-3 pt-2">
            {/* Google Calendar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#191919] border border-[#2a2a2a] hover:border-[#383838] transition">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-base font-bold text-blue-400">G</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Google Calendar</h4>
                  <p className="text-[11px] text-[#737373]">
                    {googleConnected ? "Synced & Active" : "Personal or Work account"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setGoogleConnected(!googleConnected)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  googleConnected
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-[#0078df] text-white hover:bg-[#0067c2]"
                }`}
              >
                {googleConnected ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <span>Connect</span>
                    <ExternalLink className="h-3 w-3" />
                  </>
                )}
              </button>
            </div>

            {/* Outlook Calendar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#191919] border border-[#2a2a2a] hover:border-[#383838] transition">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <span className="text-base font-bold text-sky-400">O</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Outlook Calendar</h4>
                  <p className="text-[11px] text-[#737373]">
                    {outlookConnected ? "Synced & Active" : "Microsoft 365 or Outlook"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setOutlookConnected(!outlookConnected)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  outlookConnected
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                    : "bg-[#0078df] text-white hover:bg-[#0067c2]"
                }`}
              >
                {outlookConnected ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <span>Connect</span>
                    <ExternalLink className="h-3 w-3" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2d2d2d] bg-[#191919] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2b2b2b] hover:bg-[#363636] text-white font-medium text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
