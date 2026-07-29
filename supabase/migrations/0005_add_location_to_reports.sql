-- Optional map pin for a report. Null when the reporter didn't drop one.
alter table reports
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;
