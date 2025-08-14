# SQL Server MCP 🗄️

A comprehensive **Model Context Protocol (MCP)** server for SQL Server database operations. This server provides 30+ tools for database management, querying, analysis, and administration through Claude Desktop or any MCP-compatible client.

[![GitHub stars](https://img.shields.io/github/stars/mohammadrehan1992/mssql-server-mcp?style=social)](https://github.com/mohammadrehan1992/mssql-server-mcp/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mohammadrehan1992/mssql-server-mcp?style=social)](https://github.com/mohammadrehan1992/mssql-server-mcp/network)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

## 🚀 Features

### 🔍 **Database Discovery & Schema Analysis**
- List databases, tables, views, stored procedures, and functions
- Detailed table structure analysis with columns, data types, constraints
- Index and foreign key relationship mapping
- Complete schema exploration tools

### 📊 **Data Operations & Querying**
- Execute any SQL query with parameter binding
- Table data retrieval with filtering, sorting, and pagination
- Row counting with conditional WHERE clauses
- Stored procedure execution with parameters

### ⚡ **Performance & Monitoring**
- Query execution plan analysis
- Database performance statistics
- Table size analysis and storage metrics
- Active connection monitoring
- Query performance insights

### 🔧 **Database Administration**
- Database backup creation (Full, Differential, Log)
- Database integrity checking (DBCC CHECKDB)
- Database file information (.mdf, .ldf)
- General database information and metadata

### 👥 **Security & User Management**
- List database users and roles
- User permission analysis
- Security principal information

### 🔄 **SQL Server Agent & Jobs**
- SQL Server Agent job listing
- Job execution history and status
- Automated task monitoring

## 📦 Installation

### Method 1: Install from GitHub (Recommended)

```bash
# Install globally from GitHub
npm install -g https://github.com/mohammadrehan1992/mssql-server-mcp.git
```

### Method 2: Clone and Install Locally

```bash
# Clone the repository
git clone https://github.com/mohammadrehan1992/mssql-server-mcp.git

# Navigate to the directory
cd mssql-server-mcp

# Install dependencies
npm install

# Install globally
npm install -g .
```

### Method 3: Download and Install

1. Download the ZIP file from [GitHub Releases](https://github.com/mohammadrehan1992/mssql-server-mcp/releases)
2. Extract the files
3. Open terminal in the extracted folder
4. Run the installation commands:

```bash
npm install
npm install -g .
```

### Verify Installation

After installation, verify it's working:

```bash
# Check if the command is available
sql-server-mcp --help

# Or check the installation path
which sql-server-mcp  # On macOS/Linux
where sql-server-mcp  # On Windows
```

## 🔧 Configuration

### Claude Desktop Setup

Add to your Claude Desktop configuration file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "sqlserver": {
      "command": "sql-server-mcp",
      "env": {
        "SQL_CONNECTION_STRING": "Server=localhost;Database=YourDatabase;Integrated Security=true;TrustServerCertificate=true;"
      }
    }
  }
}
```

> **Note:** If you installed locally instead of globally, use the full path to the server file:
> ```json
> {
>   "mcpServers": {
>     "sqlserver": {
>       "command": "node",
>       "args": ["/full/path/to/mssql-server-mcp/server.js"],
>       "env": {
>         "SQL_CONNECTION_STRING": "your-connection-string-here"
>       }
>     }
>   }
> }
> ```

### Connection String Examples

#### Windows Authentication (Recommended)
```
Server=localhost;Database=YourDatabase;Integrated Security=true;TrustServerCertificate=true;
```

#### SQL Server Express
```
Server=.\\SQLEXPRESS;Database=YourDatabase;Integrated Security=true;TrustServerCertificate=true;
```

#### LocalDB
```
Server=(localdb)\\MSSQLLocalDB;Database=YourDatabase;Integrated Security=true;TrustServerCertificate=true;
```

#### SQL Server Authentication
```
Server=localhost;Database=YourDatabase;User Id=username;Password=password;TrustServerCertificate=true;
```

#### Azure SQL Database
```
Server=your-server.database.windows.net;Database=YourDatabase;User Id=username;Password=password;Encrypt=true;
```

#### Named Instance with Port
```
Server=localhost\\INSTANCE_NAME,1433;Database=YourDatabase;Integrated Security=true;TrustServerCertificate=true;
```

## 🛠️ Available Tools

<details>
<summary><strong>📋 Basic Operations (2 tools)</strong></summary>

- **`execute_query`** - Execute any SQL query with optional parameters
- **`execute_stored_procedure`** - Execute stored procedures with parameters

</details>

<details>
<summary><strong>🗂️ Schema Discovery (6 tools)</strong></summary>

- **`list_databases`** - List all databases on the SQL Server instance
- **`list_tables`** - List tables with optional schema filtering
- **`list_views`** - List database views with optional schema filtering
- **`list_stored_procedures`** - List stored procedures with optional schema filtering
- **`list_functions`** - List user-defined functions with optional schema filtering
- **`list_schemas`** - List all schemas in the current database

</details>

<details>
<summary><strong>🔍 Table Structure Analysis (4 tools)</strong></summary>

- **`describe_table`** - Get detailed table structure (columns, data types, constraints)
- **`get_table_indexes`** - Get all indexes for a specific table
- **`get_table_constraints`** - Get all constraints (PK, FK, CHECK, etc.)
- **`get_foreign_keys`** - Get foreign key relationships

</details>

<details>
<summary><strong>📊 Data Operations (2 tools)</strong></summary>

- **`get_table_data`** - Retrieve table data with filtering, sorting, and pagination
- **`get_table_count`** - Get row count with optional WHERE conditions

</details>

<details>
<summary><strong>📈 Performance & Statistics (6 tools)</strong></summary>

- **`get_database_info`** - General database information and metadata
- **`get_table_sizes`** - Table size analysis and storage metrics
- **`get_active_connections`** - Information about active database connections
- **`get_database_files`** - Database file information (.mdf, .ldf)
- **`analyze_query_plan`** - Get execution plan for queries
- **`get_query_statistics`** - Performance statistics for recent queries

</details>

<details>
<summary><strong>🔧 Backup & Maintenance (2 tools)</strong></summary>

- **`backup_database`** - Create database backups (Full, Differential, Log)
- **`check_database_integrity`** - Run DBCC CHECKDB for integrity verification

</details>

<details>
<summary><strong>👥 Security & Users (3 tools)</strong></summary>

- **`list_users`** - List all database users
- **`list_roles`** - List all database roles
- **`get_user_permissions`** - Get permissions for a specific user

</details>

<details>
<summary><strong>🔄 SQL Agent & Jobs (2 tools)</strong></summary>

- **`list_sql_agent_jobs`** - List SQL Server Agent jobs
- **`get_job_history`** - Get job execution history

</details>

## 🧪 Testing Your Connection

Create a test script to verify your connection works:

```javascript
// test-connection.js
const sql = require('mssql');

async function testConnection() {
  const connectionString = 'Your-Connection-String-Here';
  
  try {
    const pool = await sql.connect(connectionString);
    const result = await pool.request().query('SELECT @@VERSION as Version');
    console.log('✅ Connection successful!');
    console.log('SQL Server Version:', result.recordset[0].Version);
    await pool.close();
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
```

Run with:
```bash
node test-connection.js
```

## 🚨 Troubleshooting

### Common Connection Issues

1. **"Failed to connect to localhost:1433"**
   - SQL Server service might not be running
   - TCP/IP protocol might be disabled
   - Try `.\SQLEXPRESS` instead of `localhost`

2. **"Login failed for user"**
   - Check username/password for SQL Authentication
   - Verify Windows Authentication is enabled
   - Ensure user has database access

3. **"Server not found"**
   - Verify server name and instance
   - Check if SQL Server Browser service is running
   - Try with explicit port: `localhost,1433`

### Enable TCP/IP Protocol

1. Open **SQL Server Configuration Manager**
2. Go to **SQL Server Network Configuration** → **Protocols for MSSQLSERVER**
3. Enable **TCP/IP**
4. Restart SQL Server service

### Find SQL Server Instances

```cmd
# List SQL Server services
sc query | findstr SQL

# List network instances
sqlcmd -L
```

## 💡 Usage Examples

### Basic Query Execution
```
Ask Claude: "Execute this query: SELECT TOP 10 * FROM Users WHERE Active = 1"
```

### Schema Exploration
```
Ask Claude: "Show me all tables in the database and describe the Users table structure"
```

### Performance Analysis
```
Ask Claude: "What are the largest tables in the database and show me recent query performance statistics"
```

### Data Analysis
```
Ask Claude: "Get the first 100 rows from the Orders table where OrderDate is from last month"
```

### Database Administration
```
Ask Claude: "Check database integrity and show me information about database files"
```

## 🔒 Security Considerations

- Use **Windows Authentication** when possible for better security
- Limit database user permissions to minimum required access
- Use **TrustServerCertificate=true** only for local development
- For production, configure proper SSL certificates
- Regularly review user permissions and access logs

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/mssql-server-mcp.git
   ```
3. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes** and test them
5. **Commit your changes**:
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request** on GitHub

### Development Setup

```bash
# Clone the repo
git clone https://github.com/mohammadrehan1992/mssql-server-mcp.git
cd mssql-server-mcp

# Install dependencies
npm install

# Test your changes
node server.js
```

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/mohammadrehan1992/mssql-server-mcp/issues) with:

- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Your environment details (OS, Node.js version, SQL Server version)
- Expected vs actual behavior

## 📋 Requirements

- **Node.js** 16.0.0 or higher
- **SQL Server** 2012 or higher (including Express, LocalDB, Azure SQL)
- **Windows** (for Windows Authentication) or SQL Server Authentication

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support & Community

- **🐛 Report Issues:** [GitHub Issues](https://github.com/mohammadrehan1992/mssql-server-mcp/issues)
- **💬 Discussions:** [GitHub Discussions](https://github.com/mohammadrehan1992/mssql-server-mcp/discussions)
- **📚 Documentation:** [GitHub Wiki](https://github.com/mohammadrehan1992/mssql-server-mcp/wiki)
- **⭐ Give us a Star:** If this project helps you, please consider [starring it](https://github.com/mohammadrehan1992/mssql-server-mcp)!

### Getting Help

1. **Check the [Issues](https://github.com/mohammadrehan1992/mssql-server-mcp/issues)** - your question might already be answered
2. **Read the [Troubleshooting](#-troubleshooting)** section below
3. **Open a new issue** with detailed information about your problem
4. **Join the discussion** in GitHub Discussions for general questions

## 🌟 Show Your Support

If this project helped you, please consider:
- ⭐ **Starring the repository**
- 🍴 **Forking it** to contribute
- 📢 **Sharing it** with others who might find it useful
- 🐛 **Reporting bugs** to help improve it

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/mohammadrehan1992/mssql-server-mcp?style=social)
![GitHub forks](https://img.shields.io/github/forks/mohammadrehan1992/mssql-server-mcp?style=social)
![GitHub issues](https://img.shields.io/github/issues/mohammadrehan1992/mssql-server-mcp)
![GitHub pull requests](https://img.shields.io/github/issues-pr/mohammadrehan1992/mssql-server-mcp)
![Last commit](https://img.shields.io/github/last-commit/mohammadrehan1992/mssql-server-mcp)

---

**Made with ❤️ for the SQL Server community**

*Developed by [Mohammad Rehan](https://github.com/mohammadrehan1992)*