import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const url = new URL(req.url);
    const path = url.pathname;
    const body = await req.json();

    // REGISTER: create user and auto-confirm email
    if (path.endsWith("/register") || path.endsWith("/signup") || path === "/register" || path === "/signup") {
      const { email, password, name, phone, role } = body;

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: "Email and password are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create user with admin API (auto-confirms email)
      const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: name || "", phone: phone || "" },
      });

      if (createError) {
        return new Response(
          JSON.stringify({ error: createError.message }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userId = userData.user.id;

      // Create profile
      const { error: profileError } = await adminClient
        .from("profiles")
        .upsert({
          id: userId,
          name: name || "",
          phone: phone || "",
          role: role || "USER",
        });

      if (profileError) {
        console.error("Profile creation error:", profileError.message);
      }

      // Create demo device if none exists
      const { data: existingDevice } = await adminClient
        .from("devices")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingDevice) {
        await adminClient.from("devices").insert({
          device_uid: "ST-001",
          user_id: userId,
          name: "Silent Trigger ST-001",
          status: "ONLINE",
          battery: 87,
          network_status: "CONNECTED",
          gps_status: "READY",
          camera_status: "READY",
          microphone_status: "READY",
          firmware_version: "1.0.0",
        });
      }

      // Create demo contacts for USER role
      if ((role || "USER") === "USER") {
        const { data: existingContact } = await adminClient
          .from("emergency_contacts")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();

        if (!existingContact) {
          await adminClient.from("emergency_contacts").insert([
            { user_id: userId, name: "Priya Sharma", relationship: "Sister", phone: "+91 98765 12345", priority: 1 },
            { user_id: userId, name: "Rahul Verma", relationship: "Friend", phone: "+91 98765 67890", priority: 2 },
          ]);
        }
      }

      return new Response(
        JSON.stringify({ success: true, userId }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown endpoint. Use /register" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
