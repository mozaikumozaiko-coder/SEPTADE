import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log("=== Get Report Function Called ===");
    console.log("Request received at:", new Date().toISOString());

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    const pollingStartTime = url.searchParams.get("pollingStartTime");
    const allReports = url.searchParams.get("all") === "true";

    console.log("Request params:", { userId, pollingStartTime, allReports });

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing userId parameter" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    let query = supabase
      .from("reports")
      .select("report_data, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (pollingStartTime && !allReports) {
      query = query.gte("updated_at", pollingStartTime);
    }

    if (allReports) {
      const { data, error } = await query;
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      console.log(`Found ${data?.length || 0} reports`);
      return new Response(
        JSON.stringify({
          success: true,
          data: data || [],
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      const { data, error } = await query.limit(1).maybeSingle();
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      console.log("Report found:", data ? "Yes" : "No");
      return new Response(
        JSON.stringify({
          success: true,
          data: data,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error fetching report:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
