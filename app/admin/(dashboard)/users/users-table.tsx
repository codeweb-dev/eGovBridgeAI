"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListPagination } from "@/components/list-pagination";
import { paginate } from "@/lib/pagination";
import { recordMatchesSearch } from "@/lib/report-search";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UserRow {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  role: string;
  created_at: string;
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const [query, setQuery] = useState("");
  const [requestedPage, setRequestedPage] = useState(0);
  const matches = users.filter((user) => recordMatchesSearch(user, query));
  const pagination = paginate(matches, requestedPage);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setRequestedPage(0);
          }}
          placeholder="Search name, email, phone, role…"
          className="pl-9"
        />
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
            {pagination.items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No users match &ldquo;{query}&rdquo;.
                </TableCell>
              </TableRow>
            ) : (
              pagination.items.map((user) => {
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
                        variant={
                          user.role === "admin" ? "default" : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <ListPagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        onPageChange={setRequestedPage}
      />
    </div>
  );
}
