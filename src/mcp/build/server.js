import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pg;
const dbUrl = process.env.SUPABASE_DB_URL;
if (!dbUrl) {
    console.error("SUPABASE_DB_URL environment variable is required");
    process.exit(1);
}
const pool = new Pool({
    connectionString: dbUrl,
});
const server = new Server({
    name: "icaffeos-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
/**
 * List available tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_schema",
                description: "Get the schema/columns of a specific table. Useful for understanding the icaffeOS multi-tenant database structure (e.g., verifying business_id alignment).",
                inputSchema: {
                    type: "object",
                    properties: {
                        table_name: {
                            type: "string",
                            description: "The name of the table to inspect",
                        },
                    },
                    required: ["table_name"],
                },
            },
            {
                name: "query_db",
                description: "Execute a read-only SELECT query against the icaffeOS Supabase backend. Use this to fetch live data about orders, inventory (weight-to-unit), or customer loyalty points. MUST BE A SELECT QUERY ONLY.",
                inputSchema: {
                    type: "object",
                    properties: {
                        sql: {
                            type: "string",
                            description: "The SELECT query to execute",
                        },
                    },
                    required: ["sql"],
                },
            },
            {
                name: "inspect_rpc",
                description: "Inspect the definition of a PL/pgSQL function (RPC). Essential for understanding core icaffeOS business logic like submit_order_v3 or loyalty calculations which bypass RLS.",
                inputSchema: {
                    type: "object",
                    properties: {
                        function_name: {
                            type: "string",
                            description: "The name of the function to inspect",
                        },
                    },
                    required: ["function_name"],
                },
            },
        ],
    };
});
/**
 * Handle tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        if (name === "get_schema") {
            const { table_name } = args;
            const query = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position;
      `;
            const result = await pool.query(query, [table_name]);
            return {
                content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }],
            };
        }
        if (name === "query_db") {
            const { sql } = args;
            // Basic read-only enforcement
            const trimmedSql = sql.trim().toUpperCase();
            if (!trimmedSql.startsWith("SELECT")) {
                throw new Error("Only SELECT queries are allowed for safety.");
            }
            // Additional safety: block common destructive keywords
            const destructiveKeywords = ["INSERT", "UPDATE", "DELETE", "DROP", "TRUNCATE", "ALTER", "GRANT", "REVOKE"];
            for (const keyword of destructiveKeywords) {
                if (trimmedSql.includes(keyword) && !trimmedSql.includes(`'${keyword}'`) && !trimmedSql.includes(`"${keyword}"`)) {
                    // This is a naive check but better than nothing
                    // A real implementation might use a SQL parser
                    if (new RegExp(`\\b${keyword}\\b`).test(trimmedSql)) {
                        throw new Error(`Command ${keyword} is not allowed.`);
                    }
                }
            }
            const result = await pool.query(sql);
            return {
                content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }],
            };
        }
        if (name === "inspect_rpc") {
            const { function_name } = args;
            const query = `
        SELECT 
          p.proname as name,
          pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = $1;
      `;
            const result = await pool.query(query, [function_name]);
            if (result.rows.length === 0) {
                return {
                    content: [{ type: "text", text: `Function '${function_name}' not found in public schema.` }],
                    isError: true
                };
            }
            return {
                content: [{ type: "text", text: result.rows[0].definition }],
            };
        }
        throw new Error(`Unknown tool: ${name}`);
    }
    catch (error) {
        return {
            content: [{ type: "text", text: error.message }],
            isError: true,
        };
    }
});
/**
 * Start the server.
 */
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("icaffeOS MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
