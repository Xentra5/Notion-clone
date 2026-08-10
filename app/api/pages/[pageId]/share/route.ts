import { NextResponse } from "next/server";
import { getPage, updatePage } from "@/lib/actions/pages";
import { addNotification } from "@/lib/actions/notifications";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params;
    const body = await req.json();
    const { email, role, isPublic } = body;

    const page = await getPage(pageId);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (typeof isPublic === "boolean") {
      await updatePage(pageId, { isPublic } as any);
    }

    if (email && role) {
      const existingCollaborators = (page as any).collaborators || [];
      const updatedCollaborators = [
        ...existingCollaborators.filter((c: any) => c.email !== email),
        { email, role },
      ];

      await updatePage(pageId, { collaborators: updatedCollaborators } as any);

      // Create notification for collaborator
      await addNotification({
        recipientId: email,
        actorName: "Workspace Admin",
        type: "page_shared",
        title: `Invited you to collaborate (${role})`,
        message: `Granted ${role} permissions on "${page.title}"`,
        pageId,
      });
    }

    const updatedPage = await getPage(pageId);
    return NextResponse.json({ page: updatedPage, success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to share page" }, { status: 500 });
  }
}
