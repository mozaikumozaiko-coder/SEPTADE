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
    console.log("Request data keys:", Object.keys(requestData));

    // Support both orderId and orderNumber for flexibility
    const { userId, reportData, orderId, orderNumber } = requestData;
    const finalOrderId = orderId || orderNumber;

    console.log("Extracted values:", {
      userId,
      orderId,
      orderNumber,
      finalOrderId,
      reportData: reportData ? "exists" : "missing",
      userIdType: typeof userId,
      orderIdType: typeof finalOrderId
    });

    if (!userId || !reportData || !finalOrderId) {
      console.error("Missing required fields:", {
        userId: !!userId,
        reportData: !!reportData,
        finalOrderId: !!finalOrderId
      });
      return new Response(
        JSON.stringify({ error: "Missing userId, reportData, or orderId/orderNumber" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("Updating diagnosis history with GPT report:", { userId, orderId: finalOrderId });

    // Find ALL records with this order_number and send_user_id
    // Update all of them to ensure all past diagnoses with the same order get the report
    const checkResult = await supabase
      .from("diagnosis_history")
      .select("id, order_number, send_user_id, created_at, updated_at")
      .eq("order_number", finalOrderId)
      .eq("send_user_id", userId);

    console.log("Existing records check:", JSON.stringify(checkResult.data, null, 2));
    console.log("Number of records found:", checkResult.data?.length || 0);

    let result;

    if (checkResult.data && checkResult.data.length > 0) {
      // Records exist, update ALL of them with the same order_number and send_user_id
      console.log("Records exist, updating all records with order:", finalOrderId);
      result = await supabase
        .from("diagnosis_history")
        .update({
          gpt_report_data: reportData,
          updated_at: new Date().toISOString(),
        })
        .eq("order_number", finalOrderId)
        .eq("send_user_id", userId)
        .select();
    } else {
      // No records found
      console.warn("No existing diagnosis history found for order:", finalOrderId);
      return new Response(
        JSON.stringify({
          success: false,
          error: "No diagnosis history found. Please create a diagnosis first.",
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

    if (result.error) {
      console.error("Database operation error:", result.error);
      throw result.error;
    }

    if (!result.data || result.data.length === 0) {
      console.error("Failed to save report for order:", finalOrderId);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to save report",
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
