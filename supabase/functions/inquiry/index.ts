import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const body = await req.json();

    const {
      propertyId,
      customerName,
      customerEmail,
      customerPhone,
      message,
    } = body;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SERVICE_ROLE_KEY")!
    );

    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      return new Response(
        JSON.stringify({
          error: "Property not found",
        }),
        {
          status: 404,
        }
      );
    }

    const { error: leadError } = await supabase
      .from("property_leads")
      .insert({
        property_id: propertyId,
        action: "inquiry",

        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        message,
      });

    if (leadError) {
      return new Response(
        JSON.stringify({
          error: leadError.message,
        }),
        {
          status: 500,
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
      }
    );
  }
});