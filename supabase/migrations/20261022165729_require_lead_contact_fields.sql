alter table public.leads
add constraint leads_required_contact_fields
check (
  length(btrim(coalesce(nome, ''))) >= 3
  and nullif(btrim(coalesce(whatsapp, '')), '') is not null
  and nullif(btrim(coalesce(email, '')), '') is not null
  and nullif(btrim(coalesce(empresa, '')), '') is not null
  and nullif(btrim(coalesce(instagram, '')), '') is not null
) not valid;
