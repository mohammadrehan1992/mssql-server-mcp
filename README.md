# SQL Server MCP Server

A Model Context Protocol (MCP) server that allows your VS Code AI assistants (like GitHub Copilot or Claude) to interact with SQL Server databases. With this, your AI can help you write and execute SQL queries directly in VS Code.

## Quick Setup

1. Clone and install:
```bash
git clone https://github.com/mohammadrehan1992/mssql-server-mcp.git
cd mssql-server-mcp
npm install
```

2. Create `.env` file with your SQL Server details:
```env
DB_SERVER=your_server_name
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
PORT=3000
```

3. Start the server:
```bash
npm start
```

4. In VS Code, open settings.json (Ctrl+Shift+P -> "Preferences: Open Settings (JSON)") and add:
```json
{
    "github.copilot.advanced": {
        "mcpServer": "http://localhost:3000"
    }
}
```

That's it! Now you can ask Copilot to help you with SQL queries in your database.

## What You Can Do

- Write and execute SQL queries using natural language
- Get help with complex SQL operations
- Let AI assist with database schema changes
- Debug SQL issues with AI help

## Features

- Implements the Model Context Protocol for SQL Server
- Supports standard SQL operations
- Connection management for SQL Server databases
- Error handling and validation
- Secure connection handling

## Prerequisites

- Node.js (v14 or higher)
- Microsoft SQL Server (2016 or higher)
- SQL Server authentication credentials or Windows Authentication

## Installation

1. Clone the repository:
```bash
git clone https://github.com/mohammadrehan1992/mssql-server-mcp.git
cd mssql-server-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Configure your environment variables by creating a `.env` file:
```env
DB_SERVER=your_server_name
DB_NAME=your_database_name
DB_USER=your_username
DB_PASSWORD=your_password
PORT=3000
```

## Usage

1. Start the MCP server:
```bash
npm start
```
Or use the provided command script:
```bash
sql-server-mcp.cmd
```

2. The server will start listening on the configured port (default: 3000)

## API Endpoints

The server implements the Model Context Protocol with the following endpoints:

- `POST /query` - Execute SQL queries
- `POST /batch` - Execute multiple SQL statements
- `POST /transaction` - Execute queries within a transaction
- `GET /status` - Get server status

## Example Usage

```javascript
// Example request to execute a query
POST http://localhost:3000/query
Content-Type: application/json

{
  "sql": "SELECT * FROM YourTable WHERE id = @id",
  "parameters": {
    "id": 1
  }
}
```

## Troubleshooting

1. Make sure SQL Server is running and accessible
2. Check your `.env` credentials
3. Confirm the MCP server is running (http://localhost:3000/status should return "ok")
4. Verify VS Code settings are correct
5. Restart VS Code if settings were changed

## Examples

Ask your AI assistant things like:
```
"Create a table for storing user profiles"
"Show me how to query orders placed in the last week"
"Help me write a stored procedure for calculating monthly sales"
```

## License

MIT License - Use it freely in your projects!

## Need Help?

Open an issue on GitHub if you run into problems.
