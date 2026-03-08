
SELECT cron.schedule(
  'check-vencimentos-daily',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://jijuegdzijgrrquvigdt.supabase.co/functions/v1/check-vencimentos',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppanVlZ2R6aWpncnJxdXZpZ2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3MTc1NzMsImV4cCI6MjA4ODI5MzU3M30.07JLLdurTn30JMNIUKaKOakznGaL3W5xYZFe9NqS02A"}'::jsonb,
      body := concat('{"time": "', now(), '"}')::jsonb
    ) AS request_id;
  $$
);
