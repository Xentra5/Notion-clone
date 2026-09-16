"use client";

import React from "react";
import {
  Code,
  Terminal,
  Database,
  Server,
  Cpu,
  Sparkles,
  Brain,
  Bot,
  Rocket,
  Flame,
  Shield,
  Globe,
  Compass,
  Bookmark,
  Layout,
  Kanban,
  Table,
  CheckSquare,
  Zap,
  Target,
  Award,
  Key,
  Lock,
  Palette,
  FileCode,
  GitBranch,
  GitPullRequest,
  Laptop,
  Smartphone,
  Cloud,
  Boxes,
  Layers,
  Package,
  Sliders,
  Activity,
  Flag,
  Bell,
  Lightbulb,
  Heart,
  Eye,
  Folder,
  FileText,
  Workflow,
  Radio,
  Wifi,
  Coffee,
  Briefcase,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Send,
  Share2,
} from "lucide-react";

export interface LogoDefinition {
  id: string;
  name: string;
  category: "Logos & Tech" | "Modern Icons";
  tags: string[];
  render: (props: { className?: string }) => React.ReactNode;
}

export const MODERN_LOGOS: LogoDefinition[] = [
  {
    id: "logo:react",
    name: "React",
    category: "Logos & Tech",
    tags: ["react", "javascript", "frontend", "ui", "framework", "meta"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="-11.5 -10.23174 23 20.46348" className={className} fill="none">
        <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
        <g stroke="#61DAFB" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    id: "logo:nextjs",
    name: "Next.js",
    category: "Logos & Tech",
    tags: ["next", "nextjs", "react", "vercel", "ssr", "fullstack"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 180 180" className={className} fill="none">
        <circle cx="90" cy="90" r="86" fill="black" stroke="currentColor" strokeWidth="6" className="text-border" />
        <path
          d="M149.508 157.438L69.833 54H54V125.979H66.5252V69.7562L139.73 164.717C143.155 162.534 146.425 160.096 149.508 157.438Z"
          fill="url(#nextjs_grad)"
        />
        <rect x="115" y="54" width="12.5" height="72" fill="white" />
        <defs>
          <linearGradient id="nextjs_grad" x1="109" y1="116.5" x2="144.5" y2="160.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: "logo:typescript",
    name: "TypeScript",
    category: "Logos & Tech",
    tags: ["typescript", "ts", "javascript", "code", "lang"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 128 128" className={className}>
        <rect width="128" height="128" rx="20" fill="#3178C6" />
        <path
          d="M60.6 86.8c-.8 5.6-3.8 9.9-8.8 12.8-5 2.9-11.4 4.4-19.1 4.4-6.4 0-12.2-1.1-17.4-3.4-5.2-2.3-9-5.4-11.6-9.4l10.3-8.8c3.4 5.3 8.6 8 15.6 8 3.9 0 6.9-.9 9-2.7 2.1-1.8 3.2-4.1 3.2-7 0-2.3-.7-4.2-2.2-5.7-1.5-1.5-4.5-3.3-9-5.3-7.5-3.4-12.8-6.6-15.8-9.8-4.5-4.7-6.7-10.4-6.7-17 0-6.9 2.5-12.6 7.4-17.1 5-4.5 11.5-6.8 19.5-6.8 5.7 0 11 .9 15.7 2.8 4.7 1.9 8.2 4.4 10.6 7.7l-9.8 9.2c-3.2-4.4-7.5-6.6-13-6.6-3.7 0-6.5.8-8.4 2.5-1.9 1.7-2.9 3.8-2.9 6.4 0 2.2.8 4.1 2.3 5.6 1.5 1.5 4.5 3.1 9.1 5 7.6 3.2 12.9 6.4 16.1 9.5 4.6 4.6 6.9 10.5 6.9 17.8zm63.4-44.5h-20.9v60.9h-14.7V42.3H67.5V30.9H124v11.4z"
          fill="#FFF"
        />
      </svg>
    ),
  },
  {
    id: "logo:javascript",
    name: "JavaScript",
    category: "Logos & Tech",
    tags: ["javascript", "js", "web", "code", "lang"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 128 128" className={className}>
        <rect width="128" height="128" rx="20" fill="#F7DF1E" />
        <path
          d="M75.6 90.9c1.6 2.8 3.9 4.8 7.4 6.1 3.5 1.3 7 1.8 10.7 1.5 4.1-.3 7.3-1.6 9.6-3.9 2.3-2.3 3.5-5.3 3.5-9.1 0-3.6-1.1-6.4-3.4-8.5-2.2-2.1-6.1-4.2-11.7-6.3-8.8-3.3-15.1-6.7-18.9-10.3-5.2-4.8-7.7-10.9-7.7-18.4 0-7.7 2.9-14 8.6-18.9 5.8-4.9 13.1-7.2 22.1-7 7.7.2 14.4 2.4 20 6.6 5.6 4.2 9.2 9.8 10.7 16.9l-13.6 3.8c-1-3.9-2.9-6.9-5.9-9.1-3-2.2-6.7-3.2-11.2-3.1-3.6.1-6.6 1.1-8.9 3-2.3 1.9-3.4 4.5-3.4 7.6 0 2.9 1 5.2 3.1 6.9 2.1 1.7 5.7 3.5 10.9 5.4 9.1 3.4 15.6 6.9 19.5 10.6 5.3 5 8 11.4 8 19.3 0 8.7-3.2 15.6-9.5 20.9-6.4 5.3-14.7 7.7-25 7.4-9.3-.3-17.1-3.1-23.3-8.4-6.2-5.3-9.9-12.4-11.1-21.2l13.9-3.9zm-46.3.3c1.2 2 2.8 3.7 4.9 4.9 2.1 1.2 4.6 1.7 7.5 1.5 3.4-.2 6-1.4 7.9-3.5 1.9-2.1 2.8-5.3 2.8-9.6V30.9H57v53.4c0 7.8-2 13.7-6 17.6-4 3.9-9.6 5.8-16.7 5.8-6.1 0-11.5-1.5-16.2-4.5-4.7-3-7.8-7.2-9.4-12.7l14.2-3.9z"
          fill="#000"
        />
      </svg>
    ),
  },
  {
    id: "logo:python",
    name: "Python",
    category: "Logos & Tech",
    tags: ["python", "py", "backend", "ai", "machine learning", "data"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 110 110" className={className}>
        <path
          d="M54.4 2C30.3 2 31.8 12.4 31.8 12.4l.03 10.8h23.2v3.3H22.4S6.8 24.7 6.8 49.3c0 24.6 13.6 23.7 13.6 23.7h8.1v-11.4s-.4-13.6 13.4-13.6h23v-19s.4-13.6-13.4-13.6zm-11.6 7.4a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6z"
          fill="#3776AB"
        />
        <path
          d="M55.6 108c24.1 0 22.6-10.4 22.6-10.4l-.03-10.8H55v-3.3h32.6s15.6 1.8 15.6-22.8c0-24.6-13.6-23.7-13.6-23.7h-8.1v11.4s.4 13.6-13.4 13.6H45.1v19s-.4 13.6 13.4 13.6zm11.6-7.4a3.8 3.8 0 1 1 0-7.6 3.8 3.8 0 0 1 0 7.6z"
          fill="#FFD43B"
        />
      </svg>
    ),
  },
  {
    id: "logo:github",
    name: "GitHub",
    category: "Logos & Tech",
    tags: ["github", "git", "repo", "opensource", "code"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 98 96" className={className} fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
        />
      </svg>
    ),
  },
  {
    id: "logo:openai",
    name: "OpenAI",
    category: "Logos & Tech",
    tags: ["openai", "chatgpt", "ai", "llm", "gpt", "model"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <path
          d="M87.4 39.5a24.2 24.2 0 0 0-1.8-17.7 24.7 24.7 0 0 0-14.7-11.7 24.4 24.4 0 0 0-21.4 3.7 24.3 24.3 0 0 0-15.3 7.8 24.6 24.6 0 0 0-5.8 17.6 24.3 24.3 0 0 0-14.6 11.8 24.4 24.4 0 0 0 1.8 24.6 24.5 24.5 0 0 0 14.7 11.7 24.4 24.4 0 0 0 21.4-3.7 24.3 24.3 0 0 0 15.3-7.8 24.6 24.6 0 0 0 5.8-17.6 24.3 24.3 0 0 0 14.6-11.8 24.4 24.4 0 0 0-1.8-24.6zm-34.9 50.4a15.4 15.4 0 0 1-10.4-4.2l1.6-2.7 12.6-7.3a4.6 4.6 0 0 0 2.3-4v-16.7l5 2.9v17.8a15.6 15.6 0 0 1-11.1 14.2zm-31-15.3a15.4 15.4 0 0 1-1.6-11.1l2.8.5 14.3 4.2a4.6 4.6 0 0 0 4.5-1.3l14.4-14.5-4.3-2.5-14.7 8.5a15.6 15.6 0 0 1-15.4-3.8zm-8.8-33.5a15.4 15.4 0 0 1 8.8-7l1.2 2.9 1.7 14.5a4.6 4.6 0 0 0 2.3 3.9l14.5 8.4-4.3 2.5-14.7-8.5a15.6 15.6 0 0 1-9.5-16.7zm49.5-15.5l-14.5-8.4 4.3-2.5 14.7 8.5a15.6 15.6 0 0 1 9.5 16.7 15.4 15.4 0 0 1-8.8 7l-1.2-2.9-1.7-14.5a4.6 4.6 0 0 0-2.3-3.9zm24.7 24.7a15.4 15.4 0 0 1 1.6 11.1l-2.8-.5-14.3-4.2a4.6 4.6 0 0 0-4.5 1.3L52.5 72.6l4.3 2.5 14.7-8.5a15.6 15.6 0 0 1 15.4 3.8zm-25.1-4.7l-7.8-4.5 7.8-4.5 7.8 4.5v9l-7.8-4.5z"
          fill="#10A37F"
        />
      </svg>
    ),
  },
  {
    id: "logo:claude",
    name: "Claude",
    category: "Logos & Tech",
    tags: ["claude", "anthropic", "ai", "llm", "model"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 100" className={className}>
        <rect width="100" height="100" rx="22" fill="#D97757" />
        <path
          d="M62 34l-9 32h-6l-9-32h7l5.5 22.5L65 34h-3z"
          fill="#FFFFFF"
        />
        <circle cx="50" cy="50" r="12" fill="#FAF5F0" fillOpacity="0.2" />
        <path
          d="M50 20v60M20 50h60M28 28l44 44M28 72l44-44"
          stroke="#FAF5F0"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "logo:docker",
    name: "Docker",
    category: "Logos & Tech",
    tags: ["docker", "container", "devops", "cloud"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 120 120" className={className}>
        <path
          d="M112 55c-2.4-1.7-7.7-1.4-11.9.4-.5-4.4-3.7-8-7.9-9.5l-2.3-.8-.9 2.2c-2.3 5.4-1.1 11.2 3.3 14.7-1.8 1-3.9 1.8-6.3 2.4H6.5c-.8 3.7-.8 11.5 2 17.5 4.3 9.4 12.6 15.6 23.3 17.4 15.5 2.7 34.6 2.3 49-7.2 12.1-7.9 19.3-21.7 20.3-33.3 4.2-.6 8.3-2.3 10.9-5.8v-.1zm-68.5-5.3h10v10h-10v-10zm0-13h10v10h-10v-10zm13 13h10v10h-10v-10zm0-13h10v10h-10v-10zm13 13h10v10h-10v-10zm-39 0h10v10h-10v-10zm0-13h10v10h-10v-10zm-13 13h10v10h-10v-10zm0-13h10v10h-10v-10z"
          fill="#2496ED"
        />
      </svg>
    ),
  },
  {
    id: "logo:tailwind",
    name: "Tailwind CSS",
    category: "Logos & Tech",
    tags: ["tailwind", "css", "style", "design", "ui"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 54 33" className={className} fill="none">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M27 0c-7.2 0-11.7 3.6-13.5 10.8 2.7-3.6 5.85-4.95 9.45-4.05 2.054.513 3.522 2.004 5.147 3.653C30.744 13.09 33.808 16.2 40.5 16.2c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C36.756 3.11 33.692 0 27 0zM13.5 16.2C6.3 16.2 1.8 19.8 0 27c2.7-3.6 5.85-4.95 9.45-4.05 2.054.514 3.522 2.004 5.147 3.653C17.244 29.29 20.308 32.4 27 32.4c7.2 0 11.7-3.6 13.5-10.8-2.7 3.6-5.85 4.95-9.45 4.05-2.054-.513-3.522-2.004-5.147-3.653C23.256 19.31 20.192 16.2 13.5 16.2z"
          fill="#38BDF8"
        />
      </svg>
    ),
  },
  {
    id: "logo:supabase",
    name: "Supabase",
    category: "Logos & Tech",
    tags: ["supabase", "database", "postgres", "auth", "backend"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 109 113" className={className} fill="none">
        <path
          d="M62.3 111.4c-3 4.2-9.6 2.3-9.9-3.1l-2.4-44.5h48.3c7.8 0 12.1 9.1 7.2 15.2l-43.2 32.4z"
          fill="#3ECF8E"
        />
        <path
          d="M46.4 1.5c3-4.2 9.6-2.3 9.9 3.1l2.4 44.5H10.4c-7.8 0-12.1-9.1-7.2-15.2L46.4 1.5z"
          fill="#249361"
        />
      </svg>
    ),
  },
  {
    id: "logo:vercel",
    name: "Vercel",
    category: "Logos & Tech",
    tags: ["vercel", "deploy", "cloud", "nextjs", "hosting"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 76 65" className={className} fill="currentColor">
        <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
      </svg>
    ),
  },
  {
    id: "logo:mongodb",
    name: "MongoDB",
    category: "Logos & Tech",
    tags: ["mongodb", "database", "nosql", "db"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 120 120" className={className} fill="none">
        <path
          d="M59.3 6.2c-1.2 1.4-10.4 12.9-17 29.5-8.5 21.1-3.6 42.1 1.7 48.7 1.8 2.2 4.1 4.5 5.8 6.4v-46c0-10.5 4.5-23.7 9.5-38.6zm1.4 0c1.2 1.4 10.4 12.9 17 29.5 8.5 21.1 3.6 42.1-1.7 48.7-1.8 2.2-4.1 4.5-5.8 6.4v-46c0-10.5-4.5-23.7-9.5-38.6z"
          fill="#13AA52"
        />
        <path
          d="M59.3 113.8c-.8-.2-1.7-1.7-1.7-2.6v-20.4c1.8 2 3.6 3.6 5.1 4.5-.4 4.5-1.9 17.5-3.4 18.5z"
          fill="#116149"
        />
      </svg>
    ),
  },
  {
    id: "logo:postgresql",
    name: "PostgreSQL",
    category: "Logos & Tech",
    tags: ["postgresql", "postgres", "sql", "database", "db"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 120 120" className={className}>
        <circle cx="60" cy="60" r="54" fill="#336791" />
        <path
          d="M74 38c-6-5-17-7-25-3-9 4-13 13-13 22 0 13 8 23 18 26v11l9-6 4 6 5-11c5-2 11-8 11-17 0-14-9-24-9-28z"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
        <circle cx="52" cy="52" r="4" fill="#336791" />
      </svg>
    ),
  },
  {
    id: "logo:rust",
    name: "Rust",
    category: "Logos & Tech",
    tags: ["rust", "rustlang", "systems", "cargo", "wasm"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 106 106" className={className} fill="currentColor">
        <circle cx="53" cy="53" r="46" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="9 4" />
        <text
          x="50%"
          y="62%"
          textAnchor="middle"
          fontSize="48"
          fontWeight="900"
          fontFamily="sans-serif"
          fill="currentColor"
        >
          R
        </text>
      </svg>
    ),
  },
  {
    id: "logo:golang",
    name: "Go (Golang)",
    category: "Logos & Tech",
    tags: ["go", "golang", "google", "backend", "concurrency"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 120 120" className={className}>
        <rect width="120" height="120" rx="24" fill="#00ACD7" />
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          fontSize="46"
          fontWeight="900"
          fontStyle="italic"
          fontFamily="system-ui, sans-serif"
          fill="#FFFFFF"
        >
          GO
        </text>
      </svg>
    ),
  },
  {
    id: "logo:nodejs",
    name: "Node.js",
    category: "Logos & Tech",
    tags: ["node", "nodejs", "javascript", "backend", "server"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 100" className={className}>
        <path
          d="M50 8l38 22v44L50 96 12 74V30L50 8z"
          fill="#5FA04E"
        />
        <path
          d="M48 24h6v28l18-10v6l-18 10v18h-6V24z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    id: "logo:graphql",
    name: "GraphQL",
    category: "Logos & Tech",
    tags: ["graphql", "api", "query", "backend"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <path
          d="M50 10l35 20v40L50 90 15 70V30L50 10z"
          stroke="#E10098"
          strokeWidth="6"
        />
        <path
          d="M50 10L15 70h70L50 10zm0 80L15 30h70L50 90z"
          stroke="#E10098"
          strokeWidth="4"
        />
        <circle cx="50" cy="10" r="7" fill="#E10098" />
        <circle cx="85" cy="30" r="7" fill="#E10098" />
        <circle cx="85" cy="70" r="7" fill="#E10098" />
        <circle cx="50" cy="90" r="7" fill="#E10098" />
        <circle cx="15" cy="70" r="7" fill="#E10098" />
        <circle cx="15" cy="30" r="7" fill="#E10098" />
      </svg>
    ),
  },
  {
    id: "logo:figma",
    name: "Figma",
    category: "Logos & Tech",
    tags: ["figma", "design", "ui", "ux", "vector"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 38 57" className={className} fill="none">
        <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" />
        <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
        <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
        <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
        <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
      </svg>
    ),
  },
  {
    id: "logo:vscode",
    name: "VS Code",
    category: "Logos & Tech",
    tags: ["vscode", "editor", "code", "microsoft", "ide"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <path
          d="M74 92L96 81V19L74 8l-42 34-18-14-8 5v34l8 5 18-14 42 34z"
          fill="#007ACC"
        />
        <path
          d="M74 92V8l22 11v62L74 92z"
          fill="#1F9CF0"
        />
        <path
          d="M74 50L32 18 6 34l26 16 42-16z"
          fill="#0065A9"
          fillOpacity="0.4"
        />
      </svg>
    ),
  },
  {
    id: "logo:apple",
    name: "Apple",
    category: "Logos & Tech",
    tags: ["apple", "mac", "ios", "macos", "iphone"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 170 170" className={className} fill="currentColor">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.7-7.94-12.04-14.57-6.5-9.98-11.59-21.46-15.28-34.46-3.68-13-5.52-25.29-5.52-36.87 0-14.73 3.68-26.69 11.04-35.88 7.36-9.18 16.59-13.9 27.69-14.15 4.93 0 10.45 1.34 16.56 4.02 6.11 2.68 10.05 4.07 11.82 4.17 1.45-.1 5.48-1.52 12.08-4.27 6.6-2.74 12.08-4.02 16.45-3.83 11.9.83 21.6 5.17 29.11 13.02-10.42 6.31-15.53 15.03-15.34 26.16.2 9.07 3.59 16.63 10.18 22.68 6.58 6.05 14.44 9.48 23.57 10.3-.9 5.37-2.32 11.05-4.25 17.06zM119.22 33.56c0-7.39 2.65-14.36 7.95-20.91 5.3-6.55 11.95-10.74 19.95-12.56.22 1.35.33 2.58.33 3.69 0 7.27-2.73 14.28-8.19 21.03-5.46 6.75-12.22 10.9-20.27 12.44-.22-1.23-.33-2.46-.33-3.69z" />
      </svg>
    ),
  },
  {
    id: "logo:linux",
    name: "Linux",
    category: "Logos & Tech",
    tags: ["linux", "os", "ubuntu", "kernel", "server"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 100" className={className}>
        <ellipse cx="50" cy="55" rx="30" ry="35" fill="#1C1C1C" />
        <ellipse cx="50" cy="58" rx="20" ry="26" fill="#FFFFFF" />
        <circle cx="43" cy="32" r="3.5" fill="#FFFFFF" />
        <circle cx="57" cy="32" r="3.5" fill="#FFFFFF" />
        <circle cx="43" cy="32" r="1.8" fill="#000000" />
        <circle cx="57" cy="32" r="1.8" fill="#000000" />
        <path d="M44 38c3 4 9 4 12 0l-6 5-6-5z" fill="#FFA500" />
        <ellipse cx="32" cy="88" rx="14" ry="7" fill="#FFA500" />
        <ellipse cx="68" cy="88" rx="14" ry="7" fill="#FFA500" />
      </svg>
    ),
  },
  {
    id: "logo:windows",
    name: "Windows",
    category: "Logos & Tech",
    tags: ["windows", "microsoft", "os", "pc"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 88 88" className={className} fill="#0078D4">
        <rect x="0" y="0" width="41" height="41" rx="4" />
        <rect x="47" y="0" width="41" height="41" rx="4" />
        <rect x="0" y="47" width="41" height="41" rx="4" />
        <rect x="47" y="47" width="41" height="41" rx="4" />
      </svg>
    ),
  },
  {
    id: "logo:notion",
    name: "Notion",
    category: "Logos & Tech",
    tags: ["notion", "docs", "notes", "workspace", "wiki"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 100" className={className}>
        <rect width="100" height="100" rx="20" fill="currentColor" className="text-foreground" />
        <path
          d="M24 24h18l24 36V24h12v52H60L36 40v36H24V24z"
          fill="currentColor"
          className="text-background"
        />
      </svg>
    ),
  },
  {
    id: "logo:linear",
    name: "Linear",
    category: "Logos & Tech",
    tags: ["linear", "issues", "agile", "project", "tasks"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 100" className={className}>
        <rect width="100" height="100" rx="22" fill="#5E6AD2" />
        <path
          d="M25 50a25 25 0 0 1 42.7-17.7L25 75V50zm50 0a25 25 0 0 1-42.7 17.7L75 25v25z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    id: "logo:slack",
    name: "Slack",
    category: "Logos & Tech",
    tags: ["slack", "chat", "team", "messaging", "work"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 120 120" className={className}>
        <path d="M26 74a12 12 0 1 1-12-12h12v12zm6 0a12 12 0 0 1 24 0v30a12 12 0 1 1-24 0V74z" fill="#E01E5A" />
        <path d="M46 26a12 12 0 1 1 12-12v12H46zm0 6a12 12 0 0 1 0 24H16a12 12 0 1 1 0-24h30z" fill="#36C5F0" />
        <path d="M94 46a12 12 0 1 1 12 12H94V46zm-6 0a12 12 0 0 1-24 0V16a12 12 0 1 1 24 0v30z" fill="#2EB67D" />
        <path d="M74 94a12 12 0 1 1-12 12V94h12zm0-6a12 12 0 0 1 0-24h30a12 12 0 1 1 0 24H74z" fill="#ECB22E" />
      </svg>
    ),
  },
  {
    id: "logo:discord",
    name: "Discord",
    category: "Logos & Tech",
    tags: ["discord", "community", "chat", "voice", "gaming"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 128 128" className={className}>
        <rect width="128" height="128" rx="26" fill="#5865F2" />
        <path
          d="M87 38c-6-3-12-5-18-5l-1 2c7 2 10 5 10 5-6-3-13-5-20-5s-14 2-20 5c0 0 3-3 10-5l-1-2c-6 0-12 2-18 5-9 14-11 27-11 40 7 5 15 5 21 6l3-4c-5-2-7-4-7-4s1 1 2 1c6 3 13 5 20 5s14-2 20-5c1 0 2-1 2-1s-2 2-7 4l3 4c6-1 14-1 21-6 0-13-2-26-11-40zm-35 32c-4 0-7-4-7-8s3-8 7-8 7 4 7 8-3 8-7 8zm24 0c-4 0-7-4-7-8s3-8 7-8 7 4 7 8-3 8-7 8z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    id: "logo:youtube",
    name: "YouTube",
    category: "Logos & Tech",
    tags: ["youtube", "video", "media", "streaming", "google"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 70" className={className}>
        <path
          d="M97.5 11c-1.1-4.3-4.5-7.7-8.8-8.8C81 0 50 0 50 0S19 0 11.3 2.2C7 3.3 3.6 6.7 2.5 11 0 18.7 0 35 0 35s0 16.3 2.5 24c1.1 4.3 4.5 7.7 8.8 8.8C19 70 50 70 50 70s31 0 38.7-2.2c4.3-1.1 7.7-4.5 8.8-8.8C100 51.3 100 35 100 35s0-16.3-2.5-24z"
          fill="#FF0000"
        />
        <polygon points="40,50 65,35 40,20" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: "logo:twitter",
    name: "X (Twitter)",
    category: "Logos & Tech",
    tags: ["x", "twitter", "social", "feed", "posts"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <path d="M78.8 12H92L63.2 45l33.8 44.7H69.6L48.2 61.8 23.6 89.7H10.4l30.8-35.3L9 12h27.9l19.4 25.6L78.8 12zm-4.6 70h7.3L32.2 19.4h-7.8l49.8 62.6z" />
      </svg>
    ),
  },
  {
    id: "logo:vite",
    name: "Vite",
    category: "Logos & Tech",
    tags: ["vite", "bundler", "frontend", "vue", "react"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 100" className={className} fill="none">
        <path
          d="M89 15L53 87c-1.5 3-5.5 3-7 0L10 15c-1.8-3.4 1-7.4 4.8-6.9l34 4.5c.8.1 1.6.1 2.4 0l33-4.5c3.8-.5 6.6 3.5 4.8 6.9z"
          fill="url(#vite_bg)"
        />
        <path
          d="M57 18L35 50h14l-8 30 28-38H54l10-24h-7z"
          fill="#FFD859"
        />
        <defs>
          <linearGradient id="vite_bg" x1="10" y1="10" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#41D1FF" />
            <stop offset="1" stopColor="#BD34FE" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: "logo:bun",
    name: "Bun",
    category: "Logos & Tech",
    tags: ["bun", "javascript", "runtime", "package", "fast"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 100" className={className}>
        <path
          d="M50 15c-24 0-38 18-38 38 0 18 16 32 38 32s38-14 38-32c0-20-14-38-38-38z"
          fill="#FBF0DF"
          stroke="#E5C7A2"
          strokeWidth="4"
        />
        <circle cx="38" cy="52" r="4" fill="#332211" />
        <circle cx="62" cy="52" r="4" fill="#332211" />
        <path d="M44 62c3 3 9 3 12 0" stroke="#332211" strokeWidth="3" strokeLinecap="round" fill="none" />
        <ellipse cx="32" cy="58" rx="4" ry="2.5" fill="#F8B4B4" />
        <ellipse cx="68" cy="58" rx="4" ry="2.5" fill="#F8B4B4" />
      </svg>
    ),
  },
  {
    id: "logo:aws",
    name: "AWS",
    category: "Logos & Tech",
    tags: ["aws", "amazon", "cloud", "serverless", "devops"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 65" className={className}>
        <text x="50%" y="38" textAnchor="middle" fontSize="30" fontWeight="900" fill="currentColor" fontFamily="sans-serif">
          aws
        </text>
        <path
          d="M18 46c20 12 44 12 64 0"
          stroke="#FF9900"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <polygon points="84,43 85,52 76,49" fill="#FF9900" />
      </svg>
    ),
  },
  {
    id: "logo:stripe",
    name: "Stripe",
    category: "Logos & Tech",
    tags: ["stripe", "payments", "checkout", "billing", "finance"],
    render: ({ className = "w-full h-full" }) => (
      <svg viewBox="0 0 100 100" className={className}>
        <rect width="100" height="100" rx="22" fill="#635BFF" />
        <path
          d="M48 38c0-2.8 2.2-4.2 6.2-4.2 5.5 0 12.3 2.1 16.5 4.6V26.2c-5-2.1-10.7-3.2-16.5-3.2-13.6 0-22.7 7-22.7 18.7 0 18.4 25.2 15.5 25.2 23.4 0 3.3-3 4.5-7.2 4.5-6.3 0-14.2-2.7-19-5.6v12.5c5.6 2.4 12.3 3.5 19 3.5 14 0 23.7-6.9 23.7-18.9 0-19.9-25.2-16.4-25.2-23.1z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
];

// Helper to make Lucide-based modern icons with standard signature
function makeLucideIcon(
  id: string,
  name: string,
  IconComp: React.ComponentType<{ className?: string }>,
  tags: string[],
  colorClass = "text-primary"
): LogoDefinition {
  return {
    id: `icon:${id}`,
    name,
    category: "Modern Icons",
    tags: [id, name.toLowerCase(), ...tags],
    render: ({ className = "w-full h-full" }) => (
      <div className={`w-full h-full flex items-center justify-center ${colorClass}`}>
        <IconComp className={className} />
      </div>
    ),
  };
}

export const MODERN_ICONS: LogoDefinition[] = [
  makeLucideIcon("terminal", "Terminal", Terminal, ["command", "cli", "bash", "code"], "text-emerald-500"),
  makeLucideIcon("code", "Code", Code, ["programming", "dev", "script"], "text-blue-500"),
  makeLucideIcon("filecode", "File Code", FileCode, ["source", "script", "file"], "text-indigo-500"),
  makeLucideIcon("gitbranch", "Git Branch", GitBranch, ["git", "version", "feature"], "text-amber-500"),
  makeLucideIcon("gitpr", "Pull Request", GitPullRequest, ["git", "review", "merge"], "text-purple-500"),
  makeLucideIcon("database", "Database", Database, ["sql", "data", "storage"], "text-cyan-500"),
  makeLucideIcon("server", "Server", Server, ["backend", "hosting", "cloud"], "text-sky-500"),
  makeLucideIcon("cpu", "Processor", Cpu, ["hardware", "compute", "chip"], "text-emerald-500"),
  makeLucideIcon("sparkles", "Sparkles", Sparkles, ["magic", "ai", "shine", "stars"], "text-amber-400"),
  makeLucideIcon("brain", "Brain / AI", Brain, ["neural", "mind", "intelligence", "llm"], "text-pink-500"),
  makeLucideIcon("bot", "AI Robot", Bot, ["agent", "assistant", "ai", "automation"], "text-violet-500"),
  makeLucideIcon("rocket", "Rocket", Rocket, ["launch", "speed", "startup", "growth"], "text-rose-500"),
  makeLucideIcon("flame", "Flame", Flame, ["hot", "fire", "trending", "streak"], "text-orange-500"),
  makeLucideIcon("shield", "Shield", Shield, ["security", "safe", "privacy", "protection"], "text-emerald-600"),
  makeLucideIcon("key", "Key", Key, ["auth", "access", "secret", "password"], "text-yellow-500"),
  makeLucideIcon("lock", "Lock", Lock, ["secure", "encryption", "private"], "text-amber-600"),
  makeLucideIcon("globe", "Globe", Globe, ["web", "world", "network", "internet"], "text-blue-500"),
  makeLucideIcon("compass", "Compass", Compass, ["explore", "direction", "navigation"], "text-teal-500"),
  makeLucideIcon("cloud", "Cloud", Cloud, ["server", "saas", "sync", "storage"], "text-sky-400"),
  makeLucideIcon("boxes", "Architecture", Boxes, ["modules", "packages", "system"], "text-indigo-500"),
  makeLucideIcon("layers", "Layers", Layers, ["stack", "design", "levels"], "text-violet-500"),
  makeLucideIcon("package", "Package", Package, ["npm", "dependency", "shipping"], "text-amber-600"),
  makeLucideIcon("kanban", "Kanban", Kanban, ["board", "agile", "workflow", "tasks"], "text-blue-500"),
  makeLucideIcon("table", "Table / Grid", Table, ["spreadsheet", "matrix", "rows"], "text-emerald-500"),
  makeLucideIcon("checksquare", "Checklist", CheckSquare, ["todo", "tasks", "done"], "text-green-500"),
  makeLucideIcon("layout", "Dashboard Layout", Layout, ["ui", "wireframe", "views"], "text-purple-500"),
  makeLucideIcon("palette", "Palette", Palette, ["design", "color", "theme", "art"], "text-pink-500"),
  makeLucideIcon("workflow", "Workflow", Workflow, ["automation", "pipeline", "process"], "text-cyan-500"),
  makeLucideIcon("target", "Target / Goals", Target, ["okr", "focus", "aim"], "text-red-500"),
  makeLucideIcon("award", "Award / Trophy", Award, ["win", "milestone", "badge"], "text-yellow-500"),
  makeLucideIcon("zap", "Zap / Fast", Zap, ["energy", "instant", "power"], "text-amber-400"),
  makeLucideIcon("bell", "Notification", Bell, ["alert", "reminder", "updates"], "text-yellow-500"),
  makeLucideIcon("heart", "Heart / Favorite", Heart, ["love", "bookmark", "star"], "text-rose-500"),
  makeLucideIcon("coffee", "Coffee", Coffee, ["break", "casual", "morning"], "text-amber-700"),
  makeLucideIcon("briefcase", "Work & Business", Briefcase, ["portfolio", "company", "career"], "text-slate-500"),
  makeLucideIcon("folder", "Folder", Folder, ["directory", "docs", "files"], "text-amber-500"),
  makeLucideIcon("filetext", "Document", FileText, ["page", "article", "draft"], "text-blue-500"),
];

export const ALL_CUSTOM_ICONS: LogoDefinition[] = [...MODERN_LOGOS, ...MODERN_ICONS];

export const ICON_MAP = new Map<string, LogoDefinition>(
  ALL_CUSTOM_ICONS.map((item) => [item.id, item])
);
