-- ============================================================
-- Kukalakala — permite apagar (limpar) uma notificação própria
--
-- Até agora só existiam policies de select/update em notifications
-- (marcar como lida) — faltava uma de delete para o botão "limpar"
-- no sino de notificações.
--
-- Como aplicar: SQL Editor do Supabase, depois de
-- 20260719120000_notifications_messaging_schema.sql.
-- ============================================================

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own"
    on public.notifications for delete
    using (auth.uid() = recipient_id);
