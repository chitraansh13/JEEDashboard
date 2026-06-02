import { createClient } from "@supabase/supabase-js";
import { flattenForImport } from "../lib/syllabus";
import * as fs from "fs";
import * as path from "path";

// Simple .env.local loader for standalone execution
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf-8");
    envFile.split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
  }
} catch (e) {
  // Ignore
}

// Bypass Node.js < 22 WebSocket check for Supabase Realtime Client
if (typeof (global as any).WebSocket === "undefined") {
  (global as any).WebSocket = class {};
}

async function main() {
  const payload = flattenForImport();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.log(JSON.stringify(payload, null, 2));
    console.log("\nNo Supabase credentials found. Printed normalized import payload instead of writing to the database.");
    return;
  }

  const supabase = createClient(url, serviceKey);

  const { error: subjectsError } = await supabase.from("subjects").upsert(payload.subjects, { onConflict: "id" });
  if (subjectsError) throw subjectsError;

  const { error: classesError } = await supabase.from("classes").upsert(payload.classes, { onConflict: "id" });
  if (classesError) throw classesError;

  const { error: unitsError } = await supabase.from("units").upsert(payload.units, { onConflict: "id" });
  if (unitsError) throw unitsError;

  const { error: chaptersError } = await supabase.from("chapters").upsert(payload.chapters, { onConflict: "id" });
  if (chaptersError) throw chaptersError;

  const { error: topicsError } = await supabase.from("topics").upsert(payload.topics, { onConflict: "id" });
  if (topicsError) throw topicsError;

  const { error: subtopicsError } = await supabase.from("subtopics").upsert(payload.subtopics, { onConflict: "id" });
  if (subtopicsError) throw subtopicsError;

  console.log(
    `Imported ${payload.subjects.length} subjects, ${payload.units.length} units, ${payload.chapters.length} chapters, ${payload.topics.length} topics, and ${payload.subtopics.length} subtopics.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
