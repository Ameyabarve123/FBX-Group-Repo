import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProfileView } from "@/components/profile-view";

async function ProfileContent() {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // Fetch additional user data from the users table if it exists
  let dbUser = null;
  try {
    const { data } = await supabase
      .from("users")
      .select("client_name, is_admin, role, address, created_at")
      .eq("user_uuid", user.id)
      .single();
    dbUser = data;
  } catch {
    // User data not found or error occurred, continue with null
    dbUser = null;
  }

  return (
    <ProfileView 
      user={user} 
      dbUser={dbUser}
    />
  );
}

export default function ProfilePage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12 p-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">View and manage your profile information</p>
      </div>
      
      <Suspense fallback={<div className="text-center py-8">Loading profile...</div>}>
        <ProfileContent />
      </Suspense>
    </div>
  );
}
