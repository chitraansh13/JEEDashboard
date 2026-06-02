create table if not exists subjects (
  id text primary key,
  name text not null unique
);

create table if not exists classes (
  id text primary key,
  name text not null unique
);

create table if not exists units (
  id text primary key,
  subject_id text not null references subjects(id) on delete cascade,
  class_id text not null references classes(id) on delete cascade,
  name text not null
);

create table if not exists chapters (
  id text primary key,
  unit_id text not null references units(id) on delete cascade,
  class_id text not null references classes(id) on delete cascade,
  chapter_name text not null,
  weightage integer default 3 not null
);

create table if not exists topics (
  id text primary key,
  chapter_id text not null references chapters(id) on delete cascade,
  topic_name text not null
);

create table if not exists subtopics (
  id text primary key,
  topic_id text not null references topics(id) on delete cascade,
  subtopic_name text not null
);

create table if not exists progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  subtopic_id text not null references subtopics(id) on delete cascade,
  learning_status text not null default 'not_started' check (learning_status in ('not_started', 'learning', 'completed')),
  revision_1 boolean not null default false,
  revision_2 boolean not null default false,
  revision_3 boolean not null default false,
  pyq_completed boolean not null default false,
  advanced_questions_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, subtopic_id)
);

create index if not exists idx_units_subject_class on units(subject_id, class_id);
create index if not exists idx_chapters_unit on chapters(unit_id);
create index if not exists idx_topics_chapter on topics(chapter_id);
create index if not exists idx_subtopics_topic on subtopics(topic_id);
create index if not exists idx_progress_user on progress(user_id);
create index if not exists idx_progress_subtopic on progress(subtopic_id);
