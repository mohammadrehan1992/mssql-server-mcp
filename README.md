# SQL Server MCP (Model Context Protocol) Server

A Model Context Protocol (MCP) implementation for Microsoft SQL Server that enables interaction with SQL Server databases through a standardized protocol.

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

## Configuration

The server can be configured through environment variables or a `.env` file:

- `DB_SERVER` - SQL Server instance name or IP address
- `DB_NAME` - Database name
- `DB_USER` - SQL Server authentication username
- `DB_PASSWORD` - SQL Server authentication password
- `PORT` - Server port (default: 3000)

## Error Handling

The server implements standard MCP error responses:

- Connection errors
- Query execution errors
- Parameter validation errors
- Transaction errors

## Security

- Uses parameterized queries to prevent SQL injection
- Supports SQL Server authentication and Windows Authentication
- Environment variable based configuration for sensitive data

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
