import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Allow unauthenticated access for this setup function
  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Create admin user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: "admin@inveta.id",
      password: "Ikurniawan1502",
      email_confirm: true,
      user_metadata: { full_name: "Admin Inveta" }
    });

    if (userError) {
      // If user already exists, get the user
      if (userError.message.includes("already been registered")) {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(u => u.email === "admin@inveta.id");
        
        if (existingUser) {
          // Check if role already exists
          const { data: existingRole } = await supabaseAdmin
            .from("user_roles")
            .select("*")
            .eq("user_id", existingUser.id)
            .eq("role", "admin")
            .single();

          if (existingRole) {
            return new Response(
              JSON.stringify({ success: true, message: "Admin sudah terdaftar", userId: existingUser.id }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Add admin role
          const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .insert({ user_id: existingUser.id, role: "admin" });

          if (roleError) throw roleError;

          return new Response(
            JSON.stringify({ success: true, message: "Role admin ditambahkan", userId: existingUser.id }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      throw userError;
    }

    // Add admin role
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userData.user.id, role: "admin" });

    if (roleError) throw roleError;

    return new Response(
      JSON.stringify({ success: true, message: "Admin berhasil dibuat", userId: userData.user.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});