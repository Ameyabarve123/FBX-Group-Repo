"use client";

import { User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, Shield, User as UserIcon } from "lucide-react";

interface DbUser {
  client_name?: string;
  is_admin?: number;
  created_at?: string;
  role?: number; 
}

const roleMap: Record<number, string> = {
  0: "Teacher",
  1: "Admin",
  2: "Student",
  3: "Enterprise",
};

export function ProfileView({
  user,
  dbUser,
}: {
  user: User;
  dbUser: DbUser | null;
}) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    console.log("dbUser:", dbUser);
    console.log("role value:", dbUser?.role, "type:", typeof dbUser?.role);
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Email Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Email</CardTitle>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">{user.email}</div>
          <p className="text-xs text-muted-foreground">Your account email</p>
        </CardContent>
      </Card>

      {/* User ID Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">User ID</CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate font-mono text-sm">
            {user.id}
          </div>
          <p className="text-xs text-muted-foreground">Unique identifier</p>
        </CardContent>
      </Card>

      {/* Account Created Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Created</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold">
            {formatDate(user.created_at)}
          </div>
          <p className="text-xs text-muted-foreground">Account creation date</p>
        </CardContent>
      </Card>

      {/* Client Name Card (if exists) */}
      {dbUser?.client_name && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Name</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbUser.client_name}</div>
            <p className="text-xs text-muted-foreground">Your name</p>
          </CardContent>
        </Card>
      )}

      {/* Admin Status Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Account Type</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge variant="default">
              {roleMap[dbUser?.role ?? 0]}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Your account permissions level
          </p>
        </CardContent>
      </Card>

      {/* Auth Provider Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Login Method</CardTitle>
          <UserIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold capitalize">
            {user.user_metadata?.provider || "Email & Password"}
          </div>
          <p className="text-xs text-muted-foreground">
            Your primary authentication method
          </p>
        </CardContent>
      </Card>

      {/* Full Details Card */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Full Profile Information</CardTitle>
          <CardDescription>
            All available information associated with your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 text-sm">
              <div className="flex justify-between items-start border-b pb-3">
                <span className="font-medium text-muted-foreground">Email:</span>
                <span className="font-mono">{user.email}</span>
              </div>
              <div className="flex justify-between items-start border-b pb-3">
                <span className="font-medium text-muted-foreground">
                  User ID:
                </span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
              <div className="flex justify-between items-start border-b pb-3">
                <span className="font-medium text-muted-foreground">
                  Account Created:
                </span>
                <span>{formatDate(user.created_at)}</span>
              </div>
              <div className="flex justify-between items-start border-b pb-3">
                <span className="font-medium text-muted-foreground">
                  Last Sign In:
                </span>
                <span>{formatDate(user.last_sign_in_at)}</span>
              </div>
              {dbUser?.client_name && (
                <div className="flex justify-between items-start border-b pb-3">
                  <span className="font-medium text-muted-foreground">
                    Client Name:
                  </span>
                  <span>{dbUser.client_name}</span>
                </div>
              )}
              <div className="flex justify-between items-start">
                <span className="font-medium text-muted-foreground">
                  Account Type:
                </span>
                <span>
                  {dbUser?.role ?? 0}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
