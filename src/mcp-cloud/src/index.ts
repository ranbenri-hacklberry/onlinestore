import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Pool } from "pg";

// Registry for SSE sessions
const sessions = new Map<string, { transport: any; server: Server }>();

// Helper for DB Pool logic
async function runQuery(env: any, sql: string, params: any[] = []) {
    console.log(`[DB] Executing: ${sql.substring(0, 100)}...`);
    const pool = new Pool({
        connectionString: env.SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false },
        max: 1,
        connectionTimeoutMillis: 10000,
    });
    try {
        const res = await pool.query(sql, params);
        console.log(`[DB] Success: ${res.rowCount} rows`);
        return res.rows;
    } catch (err: any) {
        console.error(`[DB] Error: ${err.message}`);
        throw err;
    } finally {
        await pool.end();
    }
}

export default {
    async fetch(request: Request, env: any) {
        const url = new URL(request.url);
        const apiKey = request.headers.get("X-MCP-API-Key");

        if (apiKey !== env.MCP_API_KEY) {
            return new Response("Unauthorized", { status: 401 });
        }

        if (url.pathname === "/sse") {
            const sessionId = Math.random().toString(36).substring(7);
            const { readable, writable } = new TransformStream();
            const writer = writable.getWriter();
            const encoder = new TextEncoder();

            const outgoingQueue: any[] = [];
            let queueResolver: ((value: any) => void) | null = null;

            const transport = {
                onmessage: null as any,
                onclose: null as any,
                onerror: null as any,
                start: async () => { },
                close: async () => { },
                send: async (message: any) => {
                    outgoingQueue.push(message);
                    if (queueResolver) {
                        queueResolver(true);
                        queueResolver = null;
                    }
                }
            };

            const server = new Server(
                { name: "icaffeos-mcp-cloud", version: "1.10.3" },
                { capabilities: { tools: {} } }
            );

            // Tools Definition
            server.setRequestHandler(ListToolsRequestSchema, async () => ({
                tools: [
                    {
                        name: "get_full_schema",
                        description: "Generate SQL DDL for all public tables.",
                        inputSchema: { type: "object", properties: {} }
                    },
                    {
                        name: "inspect_schema",
                        description: "Examine table columns and types.",
                        inputSchema: {
                            type: "object",
                            properties: { table_name: { type: "string" } },
                            required: ["table_name"],
                        },
                    },
                    {
                        name: "query_supa",
                        description: "Execute SQL SELECT queries.",
                        inputSchema: {
                            type: "object",
                            properties: { sql: { type: "string" } },
                            required: ["sql"],
                        },
                    },
                    {
                        name: "list_inventory",
                        description: "Get current inventory for a business.",
                        inputSchema: {
                            type: "object",
                            properties: { business_id: { type: "string" } },
                            required: ["business_id"],
                        },
                    },
                ]
            }));

            server.setRequestHandler(CallToolRequestSchema, async (request) => {
                const { name, arguments: args } = request.params;
                console.log(`[Tool] Called: ${name}`);
                try {
                    if (name === "get_full_schema") {
                        const cols = await runQuery(env, `
                            SELECT table_name, column_name, data_type, is_nullable, column_default 
                            FROM information_schema.columns 
                            WHERE table_schema = 'public' 
                            ORDER BY table_name, ordinal_position
                        `);

                        let fullSql = "-- ICAFFE OS SCHEMA DUMP\n\n";
                        let currentTable = "";

                        for (const col of cols) {
                            if (col.table_name !== currentTable) {
                                if (currentTable !== "") fullSql += "\n);\n\n";
                                currentTable = col.table_name;
                                fullSql += `CREATE TABLE ${currentTable} (\n`;
                            } else {
                                fullSql += ",\n";
                            }
                            fullSql += `  ${col.column_name} ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ' DEFAULT ' + col.column_default : ''}`;
                        }
                        if (currentTable !== "") fullSql += "\n);\n\n";

                        return { content: [{ type: "text", text: fullSql }] };
                    }
                    if (name === "inspect_schema") {
                        const table_name = (args as any)?.table_name;
                        const rows = await runQuery(env, "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1", [table_name]);
                        return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
                    }
                    if (name === "query_supa") {
                        const sql = (args as any)?.sql;
                        if (!sql || !sql.trim().toUpperCase().startsWith("SELECT")) throw new Error("Only SELECT allowed");
                        const rows = await runQuery(env, sql);
                        return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
                    }
                    if (name === "list_inventory") {
                        const business_id = (args as any)?.business_id;
                        const rows = await runQuery(env, "SELECT * FROM inventory_items WHERE business_id = $1", [business_id]);
                        return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
                    }
                    throw new Error("Tool not found");
                } catch (e: any) {
                    console.error(`[Tool Error] ${name}: ${e.message}`);
                    return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
                }
            });

            await server.connect(transport as any);
            sessions.set(sessionId, { transport, server });

            // SSE Loop (Writer Context)
            (async () => {
                try {
                    await writer.write(encoder.encode(`event: endpoint\ndata: /message?sessionId=${sessionId}\n\n`));
                    console.log(`[SSE] ${sessionId} Loop Start`);
                    while (true) {
                        if (outgoingQueue.length === 0) {
                            const timeoutPromise = new Promise(r => setTimeout(() => r('timeout'), 25000));
                            const msgPromise = new Promise(r => { queueResolver = r; });
                            const reason = await Promise.race([timeoutPromise, msgPromise]);
                            if (reason === 'timeout') {
                                await writer.write(encoder.encode(`: ping\n\n`));
                                continue;
                            }
                        }
                        while (outgoingQueue.length > 0) {
                            const msg = outgoingQueue.shift();
                            await writer.write(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`));
                        }
                    }
                } catch (e: any) {
                    console.error(`[SSE Error] ${sessionId}: ${e.message}`);
                } finally {
                    sessions.delete(sessionId);
                    try { await writer.close(); } catch { }
                }
            })();

            return new Response(readable, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive"
                }
            });
        }

        if (url.pathname === "/message") {
            const sessionId = url.searchParams.get("sessionId");
            const session = sessions.get(sessionId || "");
            if (!session) return new Response("Session dead", { status: 404 });
            const message = await request.json();
            console.log(`[POST] Message for ${sessionId}: ${message.method || 'rsp'}`);
            if (session.transport.onmessage) await session.transport.onmessage(message);
            return new Response("OK");
        }

        if (url.pathname === "/test-db") {
            try {
                const rows = await runQuery(env, "SELECT NOW()");
                return new Response(JSON.stringify({ status: "ok", result: rows }), { headers: { "Content-Type": "application/json" } });
            } catch (e: any) {
                return new Response(JSON.stringify({ status: "error", error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
            }
        }

        return new Response("icaffeOS MCP Cloud 1.10.3 Active");
    }
};
