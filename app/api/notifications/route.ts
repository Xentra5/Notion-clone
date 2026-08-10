import { NextResponse } from "next/server";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  addNotification,
} from "@/lib/actions/notifications";

export async function GET() {
  const notifications = await getNotifications();
  return NextResponse.json({ notifications });
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (body.action === "readAll") {
      await markAllNotificationsAsRead();
    } else if (body.id) {
      await markNotificationAsRead(body.id);
    }
    const notifications = await getNotifications();
    return NextResponse.json({ success: true, notifications });
  } catch {
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newNotif = await addNotification(body);
    return NextResponse.json({ notification: newNotif }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add notification" }, { status: 400 });
  }
}
