import React from "react";
import { Navbar } from "../_components/navbar";
import { Footer } from "../_components/footer";
import { DevelopersClient } from "./developers-client";

export const metadata = {
  title: "Developers - Notion API & Integrations",
  description: "Connect Notion to your tools or build custom apps with the Notion REST API and SDKs.",
};

const codeSnippet = `// Search database items using Notion API
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const response = await notion.databases.query({
  database_id: "782390f7-1290-4a8b-a190-210192830192",
  filter: {
    property: "Status",
    status: { equals: "In Progress" },
  },
});
console.log("Active Tasks:", response.results);`;

export default function DevelopersPage() {
  return (
    <main className="relative min-h-screen bg-white text-black">
      <Navbar />
      <DevelopersClient codeSnippet={codeSnippet} />
      <Footer />
    </main>
  );
}
