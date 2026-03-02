const MCP_URL = 'https://ai.hacklberryfinn.com';
const API_KEY = 'af8e1af12588e6e075528afc7a292f8b1e1b9e24468da9128dd962d0ae6e77df';
const fs = require('fs');

async function sendRpc(sessionId, method, params, id) {
    const res = await fetch(`${MCP_URL}/message?sessionId=${sessionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-MCP-API-Key': API_KEY
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id
        })
    });
    return res;
}

async function connect() {
    console.log('🔌 Connecting to MCP...');
    const response = await fetch(`${MCP_URL}/sse`, {
        headers: { 'X-MCP-API-Key': API_KEY, 'Accept': 'text/event-stream' }
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let sessionId = null;

    // Wait for session ID
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        if (text.includes('event: endpoint')) {
            sessionId = text.match(/sessionId=([^ \n\r]+)/)[1];
            break;
        }
    }
    return { sessionId, reader };
}

async function query(sessionId, sql) {
    await sendRpc(sessionId, 'tools/call', {
        name: 'query_supa',
        arguments: { sql }
    }, 'q-' + Math.random());

    // We need to wait for the response from the SSE stream
    // but for the sake of this script, we'll just assume the worker logs or we can read the stream
}

// Since reading from SSE and matching IDs in a simple script is complex,
// I will instead add a temporary "dump_schema" tool to the worker that does this in one go.
// It's much cleaner than trying to orchestrate multiple RPC calls over SSE in a CLI script.

console.log('Note: I am going to add a "dump_schema" tool to the worker to facilitate this.');
