import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ARASAAC_BASE = "https://api.arasaac.org/api";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/arasaac-proxy/, "");

    // Route: /pictograms/:language/search/:searchText
    // Example: /pictograms/es/search/comer
    const searchMatch = path.match(/^\/pictograms\/([a-z]{2})\/search\/(.+)$/);

    if (searchMatch && req.method === "GET") {
      const [, language, searchText] = searchMatch;
      const encodedSearch = encodeURIComponent(searchText);

      const apiUrl = `${ARASAAC_BASE}/pictograms/${language}/search/${encodedSearch}`;
      const response = await fetch(apiUrl, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: `ARASAAC search failed: ${response.status}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();

      const results = (Array.isArray(data) ? data : []).map((item: {
        _id: number;
        text?: string;
        keywords?: Array<{ keyword: string }>;
      }) => ({
        id: item._id,
        text: item.text || (item.keywords && item.keywords.length > 0 ? item.keywords[0].keyword : ""),
        imageUrl: `${ARASAAC_BASE}/pictograms/${item._id}?download=false`,
        previewUrl: `${ARASAAC_BASE}/pictograms/${item._id}?download=false&thumbnail=true`,
      }));

      return new Response(JSON.stringify(results), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Route: /pictograms/:id (get single pictogram image - proxy)
    const pictogramMatch = path.match(/^\/pictograms\/(\d+)$/);

    if (pictogramMatch && req.method === "GET") {
      const [, id] = pictogramMatch;
      const thumbnail = url.searchParams.get("thumbnail") === "true";

      const imageUrl = `${ARASAAC_BASE}/pictograms/${id}?download=false${thumbnail ? "&thumbnail=true" : ""}`;
      const imgResponse = await fetch(imageUrl);

      if (!imgResponse.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch pictogram image" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const blob = await imgResponse.blob();
      return new Response(blob, {
        headers: {
          ...corsHeaders,
          "Content-Type": imgResponse.headers.get("Content-Type") || "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    }

    // Route: /categories/:language
    const categoriesMatch = path.match(/^\/categories\/([a-z]{2})$/);

    if (categoriesMatch && req.method === "GET") {
      const [, language] = categoriesMatch;
      const apiUrl = `${ARASAAC_BASE}/categories/${language}`;
      const response = await fetch(apiUrl, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch categories" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Not found", path }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
