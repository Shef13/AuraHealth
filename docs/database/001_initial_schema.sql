-- PostgreSQL-compatible initial AuraCare schema plan.
-- Demonstration only. Not for diagnosis, prescribing or emergency use.

create table patients (id text primary key, name text not null, age integer not null, location text not null, diagnosis text not null, dry_weight_kg numeric(5,2) not null, current_medication text not null, preferred_phone_number text not null, preferred_channel text not null, fictional boolean not null default true, created_at timestamptz not null default now());
create table patient_consents (id text primary key, patient_id text not null references patients(id), consent_type text not null, status text not null, created_at timestamptz not null);
create table conversations (id text primary key, patient_id text not null references patients(id), channel text not null, status text not null, created_at timestamptz not null);
create table messages (id text primary key, conversation_id text not null references conversations(id), direction text not null, body text not null, provider_payload_ref text, created_at timestamptz not null);
create table media_assets (id text primary key, patient_id text not null references patients(id), provider_media_id text not null, storage_reference text not null, mime_type text not null, size_bytes integer not null, sha256 text not null, status text not null, created_at timestamptz not null);
create table weight_readings (id text primary key, patient_id text not null references patients(id), value_kg numeric(5,2) not null, source text not null, recorded_at timestamptz not null);
create table weight_extractions (id text primary key, media_asset_id text not null references media_assets(id), detected_weight_kg numeric(5,2), confidence numeric(4,3), status text not null, raw_provider_payload_ref text, created_at timestamptz not null);
create table call_permissions (id text primary key, patient_id text not null references patients(id), status text not null, created_at timestamptz not null);
create table call_sessions (id text primary key, patient_id text not null references patients(id), status text not null, started_at timestamptz, ended_at timestamptz);
create table assessment_responses (id text primary key, call_session_id text not null references call_sessions(id), question_id text not null, transcript text not null, created_at timestamptz not null);
create table analysis_events (id text primary key, patient_id text not null references patients(id), event_type text not null, summary text not null, created_at timestamptz not null);
create table risk_assessments (id text primary key, patient_id text not null references patients(id), label text not null, score numeric(4,3) not null, explanation text not null, requires_clinician_review boolean not null, created_at timestamptz not null);
create table clinical_alerts (id text primary key, patient_id text not null references patients(id), assessment_id text not null references risk_assessments(id), title text not null, status text not null, created_at timestamptz not null);
create table interventions (id text primary key, patient_id text not null references patients(id), clinician_name text not null, note text not null, created_at timestamptz not null);
create table follow_ups (id text primary key, patient_id text not null references patients(id), message text not null, scheduled_for timestamptz not null, status text not null);
create table audit_events (id text primary key, actor text not null, action text not null, target_id text not null, created_at timestamptz not null);
