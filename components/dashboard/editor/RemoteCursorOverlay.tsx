"use client";

interface RemoteCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  blockId?: string;
}

interface RemoteCursorOverlayProps {
  cursors: RemoteCursor[];
}

export function RemoteCursorOverlay({ cursors }: RemoteCursorOverlayProps) {
  if (cursors.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {cursors.map((cursor) => (
        <div
          key={cursor.id}
          className="absolute transition-all duration-75 ease-out"
          style={{
            transform: `translate3d(${cursor.x}px, ${cursor.y}px, 0)`,
          }}
        >
          {/* SVG Cursor Pointer */}
          <svg
            className="h-5 w-5 drop-shadow-md"
            viewBox="0 0 24 24"
            fill={cursor.color}
            stroke="white"
            strokeWidth="1.5"
          >
            <path d="M5.5 3.21l10.8 11.23-4.57 1.05 2.8 5.71-2.26 1.11-2.8-5.71-3.97 3.32V3.21z" />
          </svg>

          {/* User Name Flag */}
          <div
            className="ml-4 -mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md whitespace-nowrap"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </div>
  );
}
