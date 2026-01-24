import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Hono } from "hono";
import { Pool } from "pg";

const app = new Hono<{ Bindings: { SUPABASE_DB_URL: string; MCP_API_KEY: string } }>();

// Multi-tenant MCP Server for icaffeOS
const mcpServer = new Server(
    {
        name: "icaffeos-mcp-cloud",
        version: "1.1.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Memory map for SSE sessions (Note: Limited in serverless, but works for single-client/warm starts)
const transports = new Map<string, SSEServerTransport>();

// --- Tool Definitions ---
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "inspect_schema",
                description: "Examine table columns and types. Useful for discovering new fields.",
                inputSchema: {
                    type: "object",
                    properties: {
                        table_name: { type: "string" },
                    },
                    required: ["table_name"],
                },
            },
            {
                name: "query_supa",
                description: "Execute read-only SELECT queries. Essential for live inventory and order reports.",
                inputSchema: {
                    type: "object",
                    properties: {
                        sql: { type: "string" },
                    },
                    required: ["sql"],
                },
            },
            {
                name: "list_inventory",
                description: "Get detailed inventory with weight-to-unit conversion logic.",
                inputSchema: {
                    type: "object",
                    properties: {
                        business_id: { type: "string" },
                    },
                    required: ["business_id"],
                },
            },
        ],
    };
});

// --- Tool Handlers ---
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Check if SUPABASE_DB_URL is available
    const dbUrl = (globalThis as any).process?.env?.SUPABASE_DB_URL || (mcpServer as any)._dbUrl;
    // In Hono, we get it from context, but setRequestHandler is outside. 
    // We'll use a trick: store it in a singleton or just use the connectionString directly from env if available.
    // Actually, we can't easily access Hono 'c' here. 
    // We'll initialize the pool INSIDE the request if we can get the URL.

    // For now, let's assume it's in the environment (wrangler secret put).
    let connectionString = (globalThis as any).process?.env?.SUPABASE_DB_URL;
    if (!connectionString) {
        return { content: [{ type: "text", text: "Database configuration missing (SUPABASE_DB_URL)." }], isError: true };
    }
    if (!connectionString.startsWith("postgres://") && !connectionString.startsWith("postgresql://")) {
        connectionString = "postgres://" + connectionString;
    }

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 1
    });

    try {
        if (name === "inspect_schema") {
            const { table_name } = args as { table_name: string };
            const result = await pool.query(
                "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1",
                [table_name]
            );
            return { content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }] };
        }

        if (name === "list_inventory") {
            const { business_id } = args as { business_id: string };
            const query = `
                SELECT name, current_stock, unit, weight_per_unit 
                FROM inventory_items 
                WHERE business_id = $1
            `;
            const result = await pool.query(query, [business_id]);

            const processed = result.rows.map(row => {
                const units = row.weight_per_unit ? (row.current_stock / row.weight_per_unit).toFixed(2) : "N/A";
                return {
                    ...row,
                    commercial_units: units
                };
            });

            return { content: [{ type: "text", text: JSON.stringify(processed, null, 2) }] };
        }

        if (name === "query_supa") {
            const { sql } = args as { sql: string };
            if (!sql.trim().toUpperCase().startsWith("SELECT")) throw new Error("Only SELECT allowed");
            const result = await pool.query(sql);
            return { content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }] };
        }

        throw new Error("Tool not found");
    } catch (error: any) {
        return { content: [{ type: "text", text: `Database Error: ${error.message}` }], isError: true };
    } finally {
        await pool.end();
    }
});

// --- API Key Middleware ---
app.use("*", async (c, next) => {
    // Inject DB URL into globalThis so the handler can find it
    (globalThis as any).process = { env: { SUPABASE_DB_URL: c.env.SUPABASE_DB_URL } };

    const apiKey = c.req.header("X-MCP-API-Key");
    if (apiKey !== c.env.MCP_API_KEY) {
        return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
});

// --- SSE Endpoints ---
app.get("/sse", async (c) => {
    const sessionId = Math.random().toString(36).substring(7);
    const transport = new SSEServerTransport(`/message?sessionId=${sessionId}`, c.res as any);

    transports.set(sessionId, transport);

    // When connection closes, cleanup
    c.req.raw.signal.addEventListener("abort", () => {
        transports.delete(sessionId);
    });

    await mcpServer.connect(transport);

    // SSEServerTransport handles the response headers and stream internally if we pass c.res
    // But in Hono, we might need to return the response.
    // Let's use the native response from the transport.
    return (transport as any)._response;
});

app.post("/message", async (c) => {
    const sessionId = c.req.query("sessionId");
    const transport = transports.get(sessionId || "");

    if (!transport) {
        return c.json({ error: "Session not found" }, 404);
    }

    await transport.handlePostMessage(c.req.raw as any, c.res as any);
    return c.text("OK");
});

app.get("/", (c) => c.text("icaffeOS MCP Cloud is running. Use /sse for connection."));

export default app;
