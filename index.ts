#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const server = new McpServer({
    name: "Kai",
    version: "0.0.1",
});

server.tool("get_references",
    "Given a file path, a symbol in the file and its location in the file, returns references to that symbol elsewhere in the project",
    {
        filePath: z.string(),
        symbol: z.string(),
        location: z.string(),
    }, async ({ filePath, symbol, location }) => {
        try {
            const response = await axios.get('http://localhost:12345', {
                params: {
                    filePath,
                    symbol,
                    location
                }
            });
            const data = response.data;
            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({ filePath: "./pom.xml", location: { line: 12, position: 1}}),
                    }
                ]
            };
        } catch (error) {
            console.error("Error making HTTP request:", error);
            throw new Error("Failed to fetch references");
        }
    }
);

server.prompt("fix_analysis_issue", () => ({
    messages: [{
        role: "user",
        content: {
            type: "text",
            text: `@currentFile
I am trying to migrate my project to Quarkus.
I will provide you with static source code analysis information in the file highlighting a migration issue which needs to be addressed.
Fix the issue described. Before fixing the issue, reason through what changes are needed and why.
Pay attention to changes you make and impacts to external dependencies in the pom.xml as well as changes to imports we need to consider.
As you make changes that impact the pom.xml or imports, be sure you explain what needs to be updated.

# Output Instructions

Structure your output in Markdown format such as:

## Reasoning
Write the step by step reasoning in this markdown section. If you are unsure of a step or reasoning, clearly state you are unsure and why.

## Updated file

\`\`\`
// write the full updated file in this section
\`\`\`

## Additional Information (optional)

If you have any additional details or steps that need to be performed, put it here.

Here is the issue:

`,
        }
    }]
}));

server.prompt("fix_dependencies", () => ({
    messages: [{
        role: "user",
        content: {
            type: "text",
            text: `Identify whether the changes you proposed earlier require adding a new dependency, removing or updating an existing dependency in the pom.xml file.
You have access to the tools to search for and read contents of files in the project. 
Find the pom.xml file in the project, read the contents and output full content of proposed updated file.`,
        }
    }]
}));

server.prompt("update_references", () => ({
    messages: [{
        role: "user",
        content: {
            type: "text",
            text: `If you modified any code that is used elsewhere in the project, make sure that is updated as well.
You have access to the tools to search for and read contents of files in the project. Make sure you use those to find relevant files you want to update.
Always search for files before updating so that you get the full path of the file you're looking for.`,
        }
    }]
}));

server.prompt("address_additional_information", () => ({
    messages: [{
        role: "user",
        content: {
            type: "text",
            text: `Based on the additional information you produced earlier, identify whether there are other files in the project that need to be updated.
You have access to the tools to search for and read contents of files in the project. Make sure you use those to find relevant files you want to update.
Search for files you want to update, read their contents and output updated contents of those files.`,
        }
    }]
}));

async function runServer() {
    const transport = new StdioServerTransport();
    console.log("Starting server...");
    await server.connect(transport);
}

runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
