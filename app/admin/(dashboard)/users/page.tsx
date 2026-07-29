import { requireAdmin } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { Eyebrow } from "@/components/landing/eyebrow";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

      <div className="overflow-hidden rounded-2xl border">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(users ?? []).map((user) => {
              const name =
                user.full_name || user.email || user.phone || "Unnamed user";
              const initials = name.slice(0, 2).toUpperCase();
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="rounded-lg">
                        <AvatarFallback className="rounded-lg text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{name}</p>
                        {user.email && user.full_name && (
                          <p className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.phone || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.gender || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
