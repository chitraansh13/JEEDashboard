import { createClient } from "@supabase/supabase-js";
import { flattenForImport } from "../lib/syllabus";

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
