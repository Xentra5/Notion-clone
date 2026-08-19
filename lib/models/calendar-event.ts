import mongoose, { Schema } from "mongoose";

const CalendarEventSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, default: "New Event" },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
    color: {
      type: String,
      enum: ["blue", "red", "green", "yellow", "purple", "pink", "orange", "gray"],
      default: "blue",
    },
    description: { type: String, default: "" },
    location: { type: String, default: "" },
    allDay: { type: Boolean, default: false },
    tags: [{ type: String }],
    attendees: [{ type: String }],
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.CalendarEvent) {
  mongoose.deleteModel("CalendarEvent");
}

const CalendarEvent =
  mongoose.models.CalendarEvent ||
  mongoose.model("CalendarEvent", CalendarEventSchema);

export default CalendarEvent;
