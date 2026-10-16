-- Horaires confirmés par la gérante (16/10/2026) : mardi–samedi 10h30–18h30 ; lundi et dimanche fermés.
update public.business_hours set open_time = '10:30', close_time = '18:30' where weekday between 2 and 6;
update public.business_hours set open_time = null, close_time = null where weekday in (0, 1);
