import { requireAdmin } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Eyebrow } from "@/components/landing/eyebrow";
import { UsersTable } from "./users-table";

export default async function AdminUsersPage() {
  await requireAdmin();
  const { data: users } = await getSupabaseAdmin()
    .from("users")
    .select("id, full_name, email, phone, gender, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-6 py-10">
      <div>
        <Eyebrow>Administration</Eyebrow>
        <h1 className="mt-5 text-3xl font-bold tracking-tighter">Users</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {users?.length ?? 0} registered{" "}
          {users?.length === 1 ? "account" : "accounts"}.
        </p>
      </div>

      <UsersTable users={users ?? []} />
    </div>
  );
}
