import { NextResponse } from "next/server";
import { getPage, updatePage } from "@/lib/actions/pages";
import { addNotification } from "@/lib/actions/notifications";

interface Collaborator {
  email: string;
  role: string;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pageId } = await params;
    const body = await req.json();
    const { email, role, isPublic } = body as {
      email?: string;
      role?: string;
      isPublic?: boolean;
    };

    const page = await getPage(pageId);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    if (typeof isPublic === "boolean") {
      await updatePage(pageId, { isPublic } as Parameters<typeof updatePage>[1]);
    }

    if (email && role) {
      const pageRecord = page as typeof page & { collaborators?: Collaborator[] };
      const existingCollaborators = pageRecord.collaborators || [];
      const updatedCollaborators = [
        ...existingCollaborators.filter((c: Collaborator) => c.email !== email),
        { email, role },
      ];

      await updatePage(pageId, { collaborators: updatedCollaborators } as Parameters<typeof updatePage>[1]);

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
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json({ error: error.message || "Failed to share page" }, { status: 500 });
  }
}
