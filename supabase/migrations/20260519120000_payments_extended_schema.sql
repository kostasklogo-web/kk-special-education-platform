-- Payments module aliases and payment log view (extends payment_obligations / payment_transactions)

comment on table public.payment_obligations is 'Monthly charges per child (charges)';
comment on table public.payment_transactions is 'Individual payment entries (payments)';

create or replace view public.charges as
  select * from public.payment_obligations where deleted_at is null;

create or replace view public.payments as
  select * from public.payment_transactions;

create or replace view public.payment_logs as
  select
    id,
    obligation_id as charge_id,
    amount,
    payment_date,
    payment_method,
    notes,
    recorded_by_user_id,
    created_at as recorded_at
  from public.payment_transactions;
