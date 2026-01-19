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
    const orderId = url.searchParams.get("orderId");
    const pollingStartTime = url.searchParams.get("pollingStartTime");
    const allReports = url.searchParams.get("all") === "true";

    console.log("Request params:", { userId, orderId, pollingStartTime, allReports });

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
      .from("diagnosis_history")
      .select("gpt_report_data, created_at, updated_at, order_number")
      .eq("send_user_id", userId)
      .not("gpt_report_data", "is", null);

    // CRITICAL: If orderId is specified, ONLY return reports with that exact order_number
    if (orderId) {
      console.log("Filtering by order_number:", orderId);
      query = query.eq("order_number", orderId);
      // Also ensure order_number is not null
      query = query.not("order_number", "is", null);
    }

    // CRITICAL: If pollingStartTime is specified, ONLY return reports updated after that time
    if (pollingStartTime && !allReports) {
      console.log("Filtering by updated_at >=", pollingStartTime);
      query = query.gte("updated_at", pollingStartTime);
    }

    query = query.order("updated_at", { ascending: false });

    if (allReports) {
      const { data, error } = await query;
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      console.log(`Found ${data?.length || 0} reports`);

      // Transform data to match expected format
      const transformedData = (data || []).map(item => ({
        report_data: item.gpt_report_data,
        created_at: item.created_at,
        updated_at: item.updated_at,
        order_number: item.order_number,
      }));

      return new Response(
        JSON.stringify({
          success: true,
          data: transformedData,
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

      // Transform data to match expected format
      const transformedData = data ? {
        report_data: data.gpt_report_data,
        created_at: data.created_at,
        updated_at: data.updated_at,
        order_number: data.order_number,
      } : null;

      return new Response(
        JSON.stringify({
          success: true,
          data: transformedData,
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
