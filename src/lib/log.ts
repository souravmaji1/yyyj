type Event = string; 
type Details = Record<string, unknown>;

const sink = process.env.NEXT_PUBLIC_LOG_SINK ?? "console";

function emit(level: "info"|"warn"|"error", event: Event, details?: Details) {
  if (sink === "console") {
    console[level](`[${event}]`, details ?? {});
  }
  // TODO: adaptors for Sentry/Datadog without changing callers
}

export const log = { 
  info: (e: Event, d?: Details) => emit("info", e, d), 
  warn: (e: Event, d?: Details) => emit("warn", e, d), 
  error: (e: Event, d?: Details) => emit("error", e, d) 
};