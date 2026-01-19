import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
    console.log("=== Save Report Function Called ===");
    console.log("Request received at:", new Date().toISOString());

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData = await req.json();
    console.log("Request data received:", JSON.stringify(requestData, null, 2));

    const { userId, reportData, orderId } = requestData;

    if (!userId || !reportData) {
      console.error("Missing required fields:", { userId: !!userId, reportData: !!reportData });
      return new Response(
        JSON.stringify({ error: "Missing userId or reportData" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Updating diagnosis history with GPT report:", { userId, orderId });

    // First, let's check what records exist
    const checkResult = await supabase
      .from("diagnosis_history")
      .select("id, order_number, send_user_id, created_at")
      .eq("order_number", orderId);

    console.log("Existing records with this order_number:", JSON.stringify(checkResult.data, null, 2));

    // Update the diagnosis_history record with the GPT report
    const result = await supabase
      .from("diagnosis_history")
      .update({
        gpt_report_data: reportData,
      })
      .eq("order_number", orderId)
      .eq("send_user_id", userId)
      .select();

    if (result.error) {
      console.error("Database operation error:", result.error);
      throw result.error;
    }

    if (!result.data || result.data.length === 0) {
      console.error("No matching diagnosis history found for order:", orderId);
      return new Response(
        JSON.stringify({
          success: false,
          error: "No matching diagnosis history found",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("GPT report saved successfully:", result.data);

    return new Response(
      JSON.stringify({
        success: true,
        data: result.data,
        message: "Report saved successfully",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error saving report:", error);
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
