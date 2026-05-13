-- =============================================================================
-- MVP / Vercel demo: read-only access for anonymous (anon) API clients
-- =============================================================================
-- Policies are created only when `to_regclass('public.<table>')` is non-null so
-- `db push` succeeds against partial / out-of-sync schemas.
-- Demo org UUID must match get-session-context.ts + seed.sql:
--   10000000-0000-4000-8000-000000000001
-- =============================================================================

-- Reference lookups (optional tables)
do $roles$
begin
  if to_regclass('public.roles') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_roles" on public.roles';
    execute $sql$
      create policy "mvp_demo_anon_select_roles"
        on public.roles
        for select
        to anon
        using (true)
    $sql$;
  end if;
end
$roles$;

do $disc$
begin
  if to_regclass('public.therapy_disciplines') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_therapy_disciplines" on public.therapy_disciplines';
    execute $sql$
      create policy "mvp_demo_anon_select_therapy_disciplines"
        on public.therapy_disciplines
        for select
        to anon
        using (true)
    $sql$;
  end if;
end
$disc$;

-- Core org / clinical (organization_id = demo)
do $org$
begin
  if to_regclass('public.organizations') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_organizations" on public.organizations';
    execute $sql$
      create policy "mvp_demo_anon_select_organizations"
        on public.organizations
        for select
        to anon
        using (id = '10000000-0000-4000-8000-000000000001'::uuid)
    $sql$;
  end if;
end
$org$;

do $cen$
begin
  if to_regclass('public.centers') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_centers" on public.centers';
    execute $sql$
      create policy "mvp_demo_anon_select_centers"
        on public.centers
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$cen$;

do $room$
begin
  if to_regclass('public.rooms') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_rooms" on public.rooms';
    execute $sql$
      create policy "mvp_demo_anon_select_rooms"
        on public.rooms
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$room$;

do $child$
begin
  if to_regclass('public.children') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_children" on public.children';
    execute $sql$
      create policy "mvp_demo_anon_select_children"
        on public.children
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$child$;

do $par$
begin
  if to_regclass('public.parents') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_parents" on public.parents';
    execute $sql$
      create policy "mvp_demo_anon_select_parents"
        on public.parents
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$par$;

do $stf$
begin
  if to_regclass('public.staff') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_staff" on public.staff';
    execute $sql$
      create policy "mvp_demo_anon_select_staff"
        on public.staff
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$stf$;

do $ur$
begin
  if to_regclass('public.user_roles') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_user_roles" on public.user_roles';
    execute $sql$
      create policy "mvp_demo_anon_select_user_roles"
        on public.user_roles
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$ur$;

do $sup$
begin
  if to_regclass('public.supervision_relationships') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_supervision_relationships" on public.supervision_relationships';
    execute $sql$
      create policy "mvp_demo_anon_select_supervision_relationships"
        on public.supervision_relationships
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$sup$;

do $sess$
begin
  if to_regclass('public.sessions') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_sessions" on public.sessions';
    execute $sql$
      create policy "mvp_demo_anon_select_sessions"
        on public.sessions
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$sess$;

do $att$
begin
  if to_regclass('public.attendance') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_attendance" on public.attendance';
    execute $sql$
      create policy "mvp_demo_anon_select_attendance"
        on public.attendance
        for select
        to anon
        using (organization_id = '10000000-0000-4000-8000-000000000001'::uuid)
    $sql$;
  end if;
end
$att$;

do $sn$
begin
  if to_regclass('public.session_notes') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_session_notes" on public.session_notes';
    execute $sql$
      create policy "mvp_demo_anon_select_session_notes"
        on public.session_notes
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$sn$;

do $tg$
begin
  if to_regclass('public.therapy_goals') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_therapy_goals" on public.therapy_goals';
    execute $sql$
      create policy "mvp_demo_anon_select_therapy_goals"
        on public.therapy_goals
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$tg$;

do $tp$
begin
  if to_regclass('public.treatment_plans') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_treatment_plans" on public.treatment_plans';
    execute $sql$
      create policy "mvp_demo_anon_select_treatment_plans"
        on public.treatment_plans
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$tp$;

do $pr$
begin
  if to_regclass('public.progress_reports') is not null then
    begin
      execute 'drop policy if exists "mvp_demo_anon_select_progress_reports" on public.progress_reports';
      execute $pol$
        create policy "mvp_demo_anon_select_progress_reports"
          on public.progress_reports
          for select
          to anon
          using (
            organization_id = '10000000-0000-4000-8000-000000000001'::uuid
            and deleted_at is null
          )
      $pol$;
    exception
      when undefined_column then
        execute 'drop policy if exists "mvp_demo_anon_select_progress_reports" on public.progress_reports';
        execute $pol2$
          create policy "mvp_demo_anon_select_progress_reports"
            on public.progress_reports
            for select
            to anon
            using (organization_id = '10000000-0000-4000-8000-000000000001'::uuid)
        $pol2$;
    end;
  end if;
end
$pr$;

do $cpr$
begin
  if to_regclass('public.child_parent_relationships') is not null then
    begin
      execute 'drop policy if exists "mvp_demo_anon_select_child_parent_relationships" on public.child_parent_relationships';
      execute $sql$
        create policy "mvp_demo_anon_select_child_parent_relationships"
          on public.child_parent_relationships
          for select
          to anon
          using (
            deleted_at is null
            and (
              exists (
                select 1
                from public.children c
                where
                  c.id = child_parent_relationships.child_id
                  and c.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                  and c.deleted_at is null
              )
              or exists (
                select 1
                from public.parents p
                where
                  p.id = child_parent_relationships.parent_id
                  and p.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                  and p.deleted_at is null
              )
            )
          )
      $sql$;
    exception
      when undefined_column then
        execute 'drop policy if exists "mvp_demo_anon_select_child_parent_relationships" on public.child_parent_relationships';
        execute $sql2$
          create policy "mvp_demo_anon_select_child_parent_relationships"
            on public.child_parent_relationships
            for select
            to anon
            using (
              exists (
                select 1
                from public.children c
                where
                  c.id = child_parent_relationships.child_id
                  and c.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                  and c.deleted_at is null
              )
              or exists (
                select 1
                from public.parents p
                where
                  p.id = child_parent_relationships.parent_id
                  and p.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                  and p.deleted_at is null
              )
            )
        $sql2$;
    end;
  end if;
end
$cpr$;

do $prof$
begin
  if to_regclass('public.profiles') is not null and to_regclass('public.staff') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_profiles" on public.profiles';
    begin
      execute $sql$
        create policy "mvp_demo_anon_select_profiles"
          on public.profiles
          for select
          to anon
          using (
            exists (
              select 1
              from public.staff s
              where
                s.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and s.deleted_at is null
                and (s.user_id = profiles.id or s.supervisor_user_id = profiles.id)
            )
            or exists (
              select 1
              from public.therapy_goals g
              where
                g.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and g.deleted_at is null
                and g.therapist_user_id = profiles.id
            )
            or exists (
              select 1
              from public.session_notes n
              where
                n.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and n.deleted_at is null
                and n.author_user_id = profiles.id
            )
            or exists (
              select 1
              from public.attendance a
              where
                a.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and a.recorded_by_user_id = profiles.id
            )
            or exists (
              select 1
              from public.parents pa
              where
                pa.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and pa.deleted_at is null
                and pa.user_id = profiles.id
            )
            or exists (
              select 1
              from public.supervision_relationships sr
              where
                sr.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and sr.deleted_at is null
                and (sr.supervisor_user_id = profiles.id or sr.supervisee_user_id = profiles.id)
            )
          )
      $sql$;
    exception
      when undefined_table then
        raise notice 'mvp_demo profiles: full policy skipped (missing table), using staff-only: %', sqlerrm;
        execute 'drop policy if exists "mvp_demo_anon_select_profiles" on public.profiles';
        execute $fb$
          create policy "mvp_demo_anon_select_profiles"
            on public.profiles
            for select
            to anon
            using (
              exists (
                select 1
                from public.staff s
                where
                  s.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                  and s.deleted_at is null
                  and (s.user_id = profiles.id or s.supervisor_user_id = profiles.id)
              )
            )
        $fb$;
    end;
  end if;
end
$prof$;

do $files$
begin
  if to_regclass('public.files') is not null then
    begin
      execute 'drop policy if exists "mvp_demo_anon_select_files" on public.files';
      execute $p$
        create policy "mvp_demo_anon_select_files"
          on public.files
          for select
          to anon
          using (
            exists (
              select 1
              from public.children c
              where
                c.id = files.child_id
                and c.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and c.deleted_at is null
            )
          )
      $p$;
    exception
      when undefined_column then
        raise notice 'Skipping files demo policy (needs child_id): %', sqlerrm;
    end;
  end if;
end
$files$;

do $tprog$
begin
  if to_regclass('public.therapy_programs') is not null then
    begin
      execute 'drop policy if exists "mvp_demo_anon_select_therapy_programs" on public.therapy_programs';
      execute $p$
        create policy "mvp_demo_anon_select_therapy_programs"
          on public.therapy_programs
          for select
          to anon
          using (
            exists (
              select 1
              from public.children c
              where
                c.id = therapy_programs.child_id
                and c.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and c.deleted_at is null
            )
          )
      $p$;
    exception
      when undefined_column then
        raise notice 'Skipping therapy_programs demo policy: %', sqlerrm;
    end;
  end if;
end
$tprog$;
