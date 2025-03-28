# Kai MCP POC

This is a MCP server providing prompts and tools for Konveyor AI related capabilities.

## Build

Make sure you have Node v20 or above and `npm` installed.

Install dependencies:

```sh
npm install
```

To build, simply run:

```sh
npm run build
```

This should produce `./dist/index.js` file. Run `chmod +x ./dist/index.js` to make it an executable.

Ensure the `index.js` file runs:

```sh
$ ./dist/index.js
Starting server...
```

## Setup the server in Continue

Add your local MCP server to the Continue config as a block:

```yml
name: Kai MCP
version: 0.0.1
schema: v1
mcpServers:
  - name: Kai MCP
    command: npx
    args:
      - -y
      - <full_path_to_the_base_dir>/dist/index.js
```

