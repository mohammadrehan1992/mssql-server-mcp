#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const sql = require('mssql');

class SqlServerMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'sql-server-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // Table Operations
        {
          name: 'create_table',
          description: 'Create a new table in the database',
          inputSchema: {
            type: 'object',
            properties: {
              tableName: { type: 'string', description: 'Name of the table to create' },
              schemaName: { type: 'string', description: 'Schema name (optional, defaults to dbo)' },
              columns: {
                type: 'array',
                description: 'Array of column definitions',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Column name' },
                    dataType: { type: 'string', description: 'SQL Server data type' },
                    nullable: { type: 'boolean', description: 'Whether the column is nullable' },
                    isPrimaryKey: { type: 'boolean', description: 'Whether this column is part of primary key' },
                    defaultValue: { type: 'string', description: 'Default value for the column' },
                    identity: { type: 'boolean', description: 'Whether this is an identity column' }
                  },
                  required: ['name', 'dataType']
                }
              }
            },
            required: ['tableName', 'columns'],
          },
        },
        {
          name: 'drop_table',
          description: 'Drop an existing table from the database',
          inputSchema: {
            type: 'object',
            properties: {
              tableName: { type: 'string', description: 'Name of the table to drop' },
              schemaName: { type: 'string', description: 'Schema name (optional, defaults to dbo)' },
              ifExists: { type: 'boolean', description: 'Add IF EXISTS clause' }
            },
            required: ['tableName'],
          },
        },
        {
          name: 'create_view',
          description: 'Create a new view in the database',
          inputSchema: {
            type: 'object',
            properties: {
              viewName: { type: 'string', description: 'Name of the view to create' },
              schemaName: { type: 'string', description: 'Schema name (optional, defaults to dbo)' },
              query: { type: 'string', description: 'SELECT query that defines the view' },
              replaceIfExists: { type: 'boolean', description: 'Whether to replace the view if it exists' }
            },
            required: ['viewName', 'query'],
          },
        },
        {
          name: 'create_function',
          description: 'Create a new function in the database',
          inputSchema: {
            type: 'object',
            properties: {
              functionName: { type: 'string', description: 'Name of the function to create' },
              schemaName: { type: 'string', description: 'Schema name (optional, defaults to dbo)' },
              parameters: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string', description: 'Parameter name' },
                    dataType: { type: 'string', description: 'Parameter data type' }
                  },
                  required: ['name', 'dataType']
                }
              },
              returnType: { type: 'string', description: 'Return data type of the function' },
              functionBody: { type: 'string', description: 'Body of the function' },
              replaceIfExists: { type: 'boolean', description: 'Whether to replace the function if it exists' }
            },
            required: ['functionName', 'returnType', 'functionBody'],
          },
        },
        // Basic Query Operations
        {
          name: 'execute_query',
          description: 'Execute any SQL query (SELECT, INSERT, UPDATE, DELETE, etc.)',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'SQL query to execute' },
              parameters: { 
                type: 'object', 
                description: 'Optional parameters for parameterized queries',
                additionalProperties: true 
              }
            },
            required: ['query'],
          },
        },
        {
          name: 'execute_stored_procedure',
          description: 'Execute a stored procedure',
          inputSchema: {
            type: 'object',
            properties: {
              procedureName: { type: 'string', description: 'Name of the stored procedure' },
              parameters: { 
                type: 'object', 
                description: 'Parameters for the stored procedure',
                additionalProperties: true 
              }
            },
            required: ['procedureName'],
          },
        },
        
        // Database Schema Information
        {
          name: 'list_databases',
          description: 'List all databases on the SQL Server instance',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'list_tables',
          description: 'List all tables in the current database',
          inputSchema: {
            type: 'object',
            properties: {
              schemaName: { type: 'string', description: 'Filter by schema name (optional)' }
            }
          },
        },
        {
          name: 'list_views',
          description: 'List all views in the current database',
          inputSchema: {
            type: 'object',
            properties: {
              schemaName: { type: 'string', description: 'Filter by schema name (optional)' }
            }
          },
        },
        {
          name: 'list_stored_procedures',
          description: 'List all stored procedures in the current database',
          inputSchema: {
            type: 'object',
            properties: {
              schemaName: { type: 'string', description: 'Filter by schema name (optional)' }
            }
          },
        },
        {
          name: 'list_functions',
          description: 'List all user-defined functions in the current database',
          inputSchema: {
            type: 'object',
            properties: {
              schemaName: { type: 'string', description: 'Filter by schema name (optional)' }
            }
          },
        },
        {
          name: 'list_schemas',
          description: 'List all schemas in the current database',
          inputSchema: { type: 'object', properties: {} },
        },
        
        // Table Structure Information
        {
          name: 'describe_table',
          description: 'Get detailed information about a table structure',
          inputSchema: {
            type: 'object',
            properties: {
              tableName: { type: 'string', description: 'Name of the table' },
              schemaName: { type: 'string', description: 'Schema name (optional, defaults to dbo)' }
            },
            required: ['tableName'],
          },
        },
        {
          name: 'get_table_indexes',
          description: 'Get all indexes for a specific table',
          inputSchema: {
            type: 'object',
            properties: {
              tableName: { type: 'string', description: 'Name of the table' },
              schemaName: { type: 'string', description: 'Schema name (optional, defaults to dbo)' }
            },
            required: ['tableName'],
          },
        },
        {
          name: 'get_table_constraints',
          description: 'Get all constraints (PK, FK, CHECK, etc.) for a specific table',
          inputSchema: {
            type: 'object',
            properties: {
              tableName: { type: 'string', description: 'Name of the table' },
              schemaName: { type: 'string', description: 'Schema name (optional, defaults to dbo)' }
            },
            required: ['tableName'],
          },
        },
        {
          name: 'get_foreign_keys',
          description: 'Get foreign key relationships for a table',
          inputSchema: {
            type: 'object',
            properties: {
              tableName: { type: 'string', description: 'Name of the table' },
              schemaName: { type: 'string', description: 'Schema name (optional, defaults to dbo)' }
            },
            required: ['tableName'],
          },
        },
        
        // Data Operations
        {
          name: 'get_table_data',
          description: 'Get data from a table with optional filtering and pagination',
          inputSchema: {
            type: 'object',
            properties: {
              tableName: { type: 'string', description: 'Name of the table' },
              schemaName: { type: 'string', description: 'Schema name (optional)' },
              columns: { type: 'string', description: 'Comma-separated column names (optional, * for all)' },
              whereClause: { type: 'string', description: 'WHERE clause without WHERE keyword (optional)' },
              orderBy: { type: 'string', description: 'ORDER BY clause without ORDER BY keywords (optional)' },
              limit: { type: 'integer', description: 'Number of rows to return (optional)' }
            },
            required: ['tableName'],
          },
        },
        {
          name: 'get_table_count',
          description: 'Get row count for a table with optional WHERE clause',
          inputSchema: {
            type: 'object',
            properties: {
              tableName: { type: 'string', description: 'Name of the table' },
              schemaName: { type: 'string', description: 'Schema name (optional)' },
              whereClause: { type: 'string', description: 'WHERE clause without WHERE keyword (optional)' }
            },
            required: ['tableName'],
          },
        },
        
        // Database Statistics and Performance
        {
          name: 'get_database_info',
          description: 'Get general information about the current database',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_table_sizes',
          description: 'Get size information for all tables in the database',
          inputSchema: {
            type: 'object',
            properties: {
              topN: { type: 'integer', description: 'Return top N largest tables (optional)' }
            }
          },
        },
        {
          name: 'get_active_connections',
          description: 'Get information about active database connections',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_database_files',
          description: 'Get information about database files (.mdf, .ldf)',
          inputSchema: { type: 'object', properties: {} },
        },
        
        // Query Analysis
        {
          name: 'analyze_query_plan',
          description: 'Get the execution plan for a query',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'SQL query to analyze' }
            },
            required: ['query'],
          },
        },
        {
          name: 'get_query_statistics',
          description: 'Get statistics for recently executed queries',
          inputSchema: {
            type: 'object',
            properties: {
              topN: { type: 'integer', description: 'Return top N queries by duration (optional, default 10)' }
            }
          },
        },
        
        // Backup and Maintenance
        {
          name: 'backup_database',
          description: 'Create a database backup',
          inputSchema: {
            type: 'object',
            properties: {
              backupPath: { type: 'string', description: 'Full path for the backup file' },
              databaseName: { type: 'string', description: 'Database name (optional, uses current)' },
              backupType: { 
                type: 'string', 
                description: 'Backup type: FULL, DIFFERENTIAL, or LOG',
                enum: ['FULL', 'DIFFERENTIAL', 'LOG']
              }
            },
            required: ['backupPath'],
          },
        },
        {
          name: 'check_database_integrity',
          description: 'Run DBCC CHECKDB to verify database integrity',
          inputSchema: {
            type: 'object',
            properties: {
              databaseName: { type: 'string', description: 'Database name (optional, uses current)' },
              repairOption: { 
                type: 'string', 
                description: 'Repair option if issues found',
                enum: ['REPAIR_ALLOW_DATA_LOSS', 'REPAIR_FAST', 'REPAIR_REBUILD']
              }
            }
          },
        },
        
        // User and Security Management
        {
          name: 'list_users',
          description: 'List all database users',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'list_roles',
          description: 'List all database roles',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_user_permissions',
          description: 'Get permissions for a specific user',
          inputSchema: {
            type: 'object',
            properties: {
              userName: { type: 'string', description: 'Database user name' }
            },
            required: ['userName'],
          },
        },
        
        // Job and Agent Information
        {
          name: 'list_sql_agent_jobs',
          description: 'List SQL Server Agent jobs',
          inputSchema: {
            type: 'object',
            properties: {
              status: { 
                type: 'string', 
                description: 'Filter by job status (optional)',
                enum: ['enabled', 'disabled']
              }
            }
          },
        },
        {
          name: 'get_job_history',
          description: 'Get execution history for SQL Agent jobs',
          inputSchema: {
            type: 'object',
            properties: {
              jobName: { type: 'string', description: 'Specific job name (optional)' },
              days: { type: 'integer', description: 'Number of days to look back (optional, default 7)' }
            }
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const pool = await sql.connect(process.env.SQL_CONNECTION_STRING);
        let result;

        switch (name) {
          case 'create_table':
            const schema = args.schemaName || 'dbo';
            let createTableQuery = `CREATE TABLE [${schema}].[${args.tableName}] (\n`;
            
            const columnDefs = args.columns.map(col => {
              let def = `  [${col.name}] ${col.dataType}`;
              if (col.identity) {
                def += ' IDENTITY(1,1)';
              }
              if (!col.nullable) {
                def += ' NOT NULL';
              }
              if (col.defaultValue) {
                def += ` DEFAULT ${col.defaultValue}`;
              }
              return def;
            });

            // Add primary key constraint if specified
            const pkColumns = args.columns.filter(col => col.isPrimaryKey).map(col => col.name);
            if (pkColumns.length > 0) {
              columnDefs.push(`  CONSTRAINT [PK_${args.tableName}] PRIMARY KEY (${pkColumns.map(col => `[${col}]`).join(', ')})`);
            }

            createTableQuery += columnDefs.join(',\n');
            createTableQuery += '\n)';
            
            result = await pool.request().query(createTableQuery);
            return {
              content: [{
                type: 'text',
                text: `Table [${schema}].[${args.tableName}] created successfully.`,
              }],
            };

          case 'drop_table':
            const dropSchema = args.schemaName || 'dbo';
            let dropQuery = args.ifExists 
              ? `DROP TABLE IF EXISTS [${dropSchema}].[${args.tableName}]`
              : `DROP TABLE [${dropSchema}].[${args.tableName}]`;
            
            result = await pool.request().query(dropQuery);
            return {
              content: [{
                type: 'text',
                text: `Table [${dropSchema}].[${args.tableName}] dropped successfully.`,
              }],
            };

          case 'create_view':
            const viewSchema = args.schemaName || 'dbo';
            let createViewQuery = args.replaceIfExists
              ? `CREATE OR ALTER VIEW [${viewSchema}].[${args.viewName}] AS\n${args.query}`
              : `CREATE VIEW [${viewSchema}].[${args.viewName}] AS\n${args.query}`;
            
            result = await pool.request().query(createViewQuery);
            return {
              content: [{
                type: 'text',
                text: `View [${viewSchema}].[${args.viewName}] created successfully.`,
              }],
            };

          case 'create_function':
            const funcSchema = args.schemaName || 'dbo';
            let createFuncQuery = args.replaceIfExists
              ? `CREATE OR ALTER FUNCTION [${funcSchema}].[${args.functionName}] `
              : `CREATE FUNCTION [${funcSchema}].[${args.functionName}] `;
            
            // Add parameters if provided
            if (args.parameters && args.parameters.length > 0) {
              const params = args.parameters.map(p => `@${p.name} ${p.dataType}`).join(', ');
              createFuncQuery += `(${params})`;
            } else {
              createFuncQuery += '()';
            }
            
            createFuncQuery += `\nRETURNS ${args.returnType}\nAS\nBEGIN\n${args.functionBody}\nEND`;
            
            result = await pool.request().query(createFuncQuery);
            return {
              content: [{
                type: 'text',
                text: `Function [${funcSchema}].[${args.functionName}] created successfully.`,
              }],
            };

          case 'execute_query':
            const request = pool.request();
            if (args.parameters) {
              Object.entries(args.parameters).forEach(([key, value]) => {
                request.input(key, value);
              });
            }
            result = await request.query(args.query);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  recordset: result.recordset,
                  rowsAffected: result.rowsAffected,
                  recordsets: result.recordsets?.length || 1
                }, null, 2),
              }],
            };

          case 'execute_stored_procedure':
            const spRequest = pool.request();
            if (args.parameters) {
              Object.entries(args.parameters).forEach(([key, value]) => {
                spRequest.input(key, value);
              });
            }
            result = await spRequest.execute(args.procedureName);
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({
                  recordsets: result.recordsets,
                  output: result.output,
                  returnValue: result.returnValue
                }, null, 2),
              }],
            };

          case 'list_databases':
            result = await pool.request().query(`
              SELECT name, database_id, create_date, collation_name, 
                     state_desc, recovery_model_desc, compatibility_level
              FROM sys.databases 
              WHERE database_id > 4  -- Exclude system databases
              ORDER BY name
            `);
            break;

          case 'list_tables':
            let tableQuery = `
              SELECT t.TABLE_SCHEMA, t.TABLE_NAME, t.TABLE_TYPE
              FROM INFORMATION_SCHEMA.TABLES t
              WHERE t.TABLE_TYPE = 'BASE TABLE'
            `;
            if (args.schemaName) {
              tableQuery += ` AND t.TABLE_SCHEMA = '${args.schemaName}'`;
            }
            tableQuery += ' ORDER BY t.TABLE_SCHEMA, t.TABLE_NAME';
            result = await pool.request().query(tableQuery);
            break;

          case 'list_views':
            let viewQuery = `
              SELECT TABLE_SCHEMA, TABLE_NAME, VIEW_DEFINITION
              FROM INFORMATION_SCHEMA.VIEWS
            `;
            if (args.schemaName) {
              viewQuery += ` WHERE TABLE_SCHEMA = '${args.schemaName}'`;
            }
            viewQuery += ' ORDER BY TABLE_SCHEMA, TABLE_NAME';
            result = await pool.request().query(viewQuery);
            break;

          case 'list_stored_procedures':
            let spQuery = `
              SELECT ROUTINE_SCHEMA, ROUTINE_NAME, ROUTINE_TYPE, CREATED, LAST_ALTERED
              FROM INFORMATION_SCHEMA.ROUTINES
              WHERE ROUTINE_TYPE = 'PROCEDURE'
            `;
            if (args.schemaName) {
              spQuery += ` AND ROUTINE_SCHEMA = '${args.schemaName}'`;
            }
            spQuery += ' ORDER BY ROUTINE_SCHEMA, ROUTINE_NAME';
            result = await pool.request().query(spQuery);
            break;

          case 'list_functions':
            let funcQuery = `
              SELECT ROUTINE_SCHEMA, ROUTINE_NAME, ROUTINE_TYPE, DATA_TYPE, CREATED, LAST_ALTERED
              FROM INFORMATION_SCHEMA.ROUTINES
              WHERE ROUTINE_TYPE = 'FUNCTION'
            `;
            if (args.schemaName) {
              funcQuery += ` AND ROUTINE_SCHEMA = '${args.schemaName}'`;
            }
            funcQuery += ' ORDER BY ROUTINE_SCHEMA, ROUTINE_NAME';
            result = await pool.request().query(funcQuery);
            break;

          case 'list_schemas':
            result = await pool.request().query(`
              SELECT schema_name, schema_id
              FROM INFORMATION_SCHEMA.SCHEMATA
              ORDER BY schema_name
            `);
            break;

          case 'describe_table':
            const describeSchema = args.schemaName || 'dbo';
            result = await pool.request().query(`
              SELECT 
                c.COLUMN_NAME,
                c.DATA_TYPE,
                c.IS_NULLABLE,
                c.COLUMN_DEFAULT,
                c.CHARACTER_MAXIMUM_LENGTH,
                c.NUMERIC_PRECISION,
                c.NUMERIC_SCALE,
                c.ORDINAL_POSITION,
                CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'YES' ELSE 'NO' END AS IS_PRIMARY_KEY
              FROM INFORMATION_SCHEMA.COLUMNS c
              LEFT JOIN (
                SELECT ku.COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku
                JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc ON ku.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
                WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
                AND ku.TABLE_NAME = '${args.tableName}' 
                AND ku.TABLE_SCHEMA = '${describeSchema}'
              ) pk ON c.COLUMN_NAME = pk.COLUMN_NAME
              WHERE c.TABLE_NAME = '${args.tableName}' 
              AND c.TABLE_SCHEMA = '${describeSchema}'
              ORDER BY c.ORDINAL_POSITION
            `);
            break;

          case 'get_table_indexes':
            const indexSchema = args.schemaName || 'dbo';
            result = await pool.request().query(`
              SELECT 
                i.name AS IndexName,
                i.type_desc AS IndexType,
                i.is_unique AS IsUnique,
                i.is_primary_key AS IsPrimaryKey,
                STRING_AGG(c.name, ', ') AS IndexColumns
              FROM sys.indexes i
              JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
              JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
              JOIN sys.objects o ON i.object_id = o.object_id
              JOIN sys.schemas s ON o.schema_id = s.schema_id
              WHERE o.name = '${args.tableName}' 
              AND s.name = '${indexSchema}'
              AND i.type > 0  -- Exclude heap
              GROUP BY i.name, i.type_desc, i.is_unique, i.is_primary_key
              ORDER BY i.name
            `);
            break;

          case 'get_table_constraints':
            const constraintSchema = args.schemaName || 'dbo';
            result = await pool.request().query(`
              SELECT 
                tc.CONSTRAINT_NAME,
                tc.CONSTRAINT_TYPE,
                STRING_AGG(kcu.COLUMN_NAME, ', ') AS Columns,
                rc.UNIQUE_CONSTRAINT_NAME AS ReferencedConstraint,
                ccu.TABLE_NAME AS ReferencedTable,
                STRING_AGG(ccu.COLUMN_NAME, ', ') AS ReferencedColumns
              FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
              LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
                ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
              LEFT JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc 
                ON tc.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
              LEFT JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu 
                ON rc.UNIQUE_CONSTRAINT_NAME = ccu.CONSTRAINT_NAME
              WHERE tc.TABLE_NAME = '${args.tableName}' 
              AND tc.TABLE_SCHEMA = '${constraintSchema}'
              GROUP BY tc.CONSTRAINT_NAME, tc.CONSTRAINT_TYPE, rc.UNIQUE_CONSTRAINT_NAME, ccu.TABLE_NAME
              ORDER BY tc.CONSTRAINT_TYPE, tc.CONSTRAINT_NAME
            `);
            break;

          case 'get_foreign_keys':
            const fkSchema = args.schemaName || 'dbo';
            result = await pool.request().query(`
              SELECT 
                f.name AS ForeignKeyName,
                OBJECT_SCHEMA_NAME(f.parent_object_id) AS SchemaName,
                OBJECT_NAME(f.parent_object_id) AS TableName,
                COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
                OBJECT_SCHEMA_NAME(f.referenced_object_id) AS ReferencedSchemaName,
                OBJECT_NAME(f.referenced_object_id) AS ReferencedTableName,
                COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferencedColumnName,
                f.delete_referential_action_desc AS DeleteAction,
                f.update_referential_action_desc AS UpdateAction
              FROM sys.foreign_keys AS f
              INNER JOIN sys.foreign_key_columns AS fc ON f.object_id = fc.constraint_object_id
              WHERE OBJECT_SCHEMA_NAME(f.parent_object_id) = '${fkSchema}'
              AND OBJECT_NAME(f.parent_object_id) = '${args.tableName}'
              ORDER BY f.name, fc.constraint_column_id
            `);
            break;

          case 'get_table_data':
            const dataSchema = args.schemaName || 'dbo';
            const columns = args.columns || '*';
            let dataQuery = `SELECT ${args.limit ? `TOP ${args.limit}` : ''} ${columns} FROM [${dataSchema}].[${args.tableName}]`;
            
            if (args.whereClause) {
              dataQuery += ` WHERE ${args.whereClause}`;
            }
            if (args.orderBy) {
              dataQuery += ` ORDER BY ${args.orderBy}`;
            }
            
            result = await pool.request().query(dataQuery);
            break;

          case 'get_table_count':
            const countSchema = args.schemaName || 'dbo';
            let countQuery = `SELECT COUNT(*) as RowCount FROM [${countSchema}].[${args.tableName}]`;
            
            if (args.whereClause) {
              countQuery += ` WHERE ${args.whereClause}`;
            }
            
            result = await pool.request().query(countQuery);
            break;

          case 'get_database_info':
            result = await pool.request().query(`
              SELECT 
                DB_NAME() AS DatabaseName,
                SUSER_SNAME() AS CurrentUser,
                @@VERSION AS SQLServerVersion,
                @@SERVERNAME AS ServerName,
                GETDATE() AS CurrentDateTime,
                (SELECT recovery_model_desc FROM sys.databases WHERE name = DB_NAME()) AS RecoveryModel,
                (SELECT collation_name FROM sys.databases WHERE name = DB_NAME()) AS Collation,
                (SELECT compatibility_level FROM sys.databases WHERE name = DB_NAME()) AS CompatibilityLevel
            `);
            break;

          case 'get_table_sizes':
            let sizeQuery = `
              SELECT ${args.topN ? `TOP ${args.topN}` : ''} 
                t.NAME AS TableName,
                s.Name AS SchemaName,
                p.rows AS RowCounts,
                SUM(a.total_pages) * 8 AS TotalSpaceKB,
                SUM(a.used_pages) * 8 AS UsedSpaceKB,
                (SUM(a.total_pages) - SUM(a.used_pages)) * 8 AS UnusedSpaceKB
              FROM sys.tables t
              INNER JOIN sys.indexes i ON t.OBJECT_ID = i.object_id
              INNER JOIN sys.partitions p ON i.object_id = p.OBJECT_ID AND i.index_id = p.index_id
              INNER JOIN sys.allocation_units a ON p.partition_id = a.container_id
              LEFT OUTER JOIN sys.schemas s ON t.schema_id = s.schema_id
              WHERE t.NAME NOT LIKE 'dt%' 
              AND t.is_ms_shipped = 0
              AND i.OBJECT_ID > 255
              GROUP BY t.Name, s.Name, p.Rows
              ORDER BY SUM(a.total_pages) DESC
            `;
            result = await pool.request().query(sizeQuery);
            break;

          case 'get_active_connections':
            result = await pool.request().query(`
              SELECT 
                session_id,
                login_name,
                host_name,
                program_name,
                status,
                cpu_time,
                memory_usage,
                total_scheduled_time,
                last_request_start_time,
                last_request_end_time,
                reads,
                writes,
                logical_reads
              FROM sys.dm_exec_sessions 
              WHERE is_user_process = 1
              ORDER BY last_request_start_time DESC
            `);
            break;

          case 'get_database_files':
            result = await pool.request().query(`
              SELECT 
                name AS FileName,
                physical_name AS PhysicalPath,
                type_desc AS FileType,
                size * 8 / 1024 AS SizeMB,
                max_size * 8 / 1024 AS MaxSizeMB,
                is_percent_growth,
                growth AS GrowthSetting,
                state_desc AS FileState
              FROM sys.database_files
              ORDER BY file_id
            `);
            break;

          case 'analyze_query_plan':
            result = await pool.request().query(`
              SET SHOWPLAN_ALL ON;
              ${args.query};
              SET SHOWPLAN_ALL OFF;
            `);
            break;

          case 'get_query_statistics':
            const topQueries = args.topN || 10;
            result = await pool.request().query(`
              SELECT TOP ${topQueries}
                qs.execution_count,
                qs.total_elapsed_time / 1000000.0 AS total_elapsed_time_sec,
                qs.total_worker_time / 1000000.0 AS total_cpu_time_sec,
                qs.total_logical_reads,
                qs.total_logical_writes,
                qs.creation_time,
                qs.last_execution_time,
                SUBSTRING(qt.text, (qs.statement_start_offset/2)+1,
                  ((CASE qs.statement_end_offset
                    WHEN -1 THEN DATALENGTH(qt.text)
                    ELSE qs.statement_end_offset
                    END - qs.statement_start_offset)/2)+1) AS statement_text
              FROM sys.dm_exec_query_stats qs
              CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) qt
              ORDER BY qs.total_elapsed_time DESC
            `);
            break;

          case 'backup_database':
            const backupType = args.backupType || 'FULL';
            const dbName = args.databaseName || 'DB_NAME()';
            const backupQuery = `
              BACKUP DATABASE ${dbName} 
              TO DISK = '${args.backupPath}' 
              WITH FORMAT, INIT, 
              NAME = '${dbName} ${backupType} Backup', 
              SKIP, NOREWIND, NOUNLOAD, STATS = 10
            `;
            result = await pool.request().query(backupQuery);
            break;

          case 'check_database_integrity':
            const checkDbName = args.databaseName || 'DB_NAME()';
            let checkQuery = `DBCC CHECKDB('${checkDbName}')`;
            if (args.repairOption) {
              checkQuery += ` WITH ${args.repairOption}`;
            }
            result = await pool.request().query(checkQuery);
            break;

          case 'list_users':
            result = await pool.request().query(`
              SELECT 
                name AS UserName,
                type_desc AS UserType,
                authentication_type_desc AS AuthenticationType,
                default_schema_name AS DefaultSchema,
                create_date,
                modify_date,
                is_fixed_role
              FROM sys.database_principals 
              WHERE type IN ('S', 'U', 'G')  -- SQL users, Windows users, Windows groups
              ORDER BY name
            `);
            break;

          case 'list_roles':
            result = await pool.request().query(`
              SELECT 
                name AS RoleName,
                type_desc AS RoleType,
                is_fixed_role AS IsFixedRole
              FROM sys.database_principals 
              WHERE type = 'R'  -- Roles
              ORDER BY name
            `);
            break;

          case 'get_user_permissions':
            result = await pool.request().query(`
              SELECT 
                p.permission_name,
                p.permission_state_desc AS PermissionState,
                p.class_desc AS ObjectClass,
                OBJECT_SCHEMA_NAME(p.major_id) AS SchemaName,
                OBJECT_NAME(p.major_id) AS ObjectName
              FROM sys.database_permissions p
              LEFT JOIN sys.database_principals pr ON p.grantee_principal_id = pr.principal_id
              WHERE pr.name = '${args.userName}'
              ORDER BY p.permission_name, p.class_desc
            `);
            break;

          case 'list_sql_agent_jobs':
            let jobQuery = `
              SELECT 
                job_id,
                name AS JobName,
                enabled,
                description,
                date_created,
                date_modified,
                CASE 
                  WHEN enabled = 1 THEN 'Enabled'
                  ELSE 'Disabled'
                END AS Status
              FROM msdb.dbo.sysjobs
            `;
            if (args.status) {
              jobQuery += ` WHERE enabled = ${args.status === 'enabled' ? 1 : 0}`;
            }
            jobQuery += ' ORDER BY name';
            result = await pool.request().query(jobQuery);
            break;

          case 'get_job_history':
            const lookbackDays = args.days || 7;
            let historyQuery = `
              SELECT 
                j.name AS JobName,
                jh.step_name AS StepName,
                jh.run_date,
                jh.run_time,
                jh.run_duration,
                CASE jh.run_status
                  WHEN 0 THEN 'Failed'
                  WHEN 1 THEN 'Succeeded'
                  WHEN 2 THEN 'Retry'
                  WHEN 3 THEN 'Canceled'
                  WHEN 4 THEN 'In Progress'
                END AS RunStatus,
                jh.message
              FROM msdb.dbo.sysjobhistory jh
              INNER JOIN msdb.dbo.sysjobs j ON jh.job_id = j.job_id
              WHERE jh.run_date >= CONVERT(int, CONVERT(varchar(8), DATEADD(day, -${lookbackDays}, GETDATE()), 112))
            `;
            if (args.jobName) {
              historyQuery += ` AND j.name = '${args.jobName}'`;
            }
            historyQuery += ' ORDER BY jh.run_date DESC, jh.run_time DESC';
            result = await pool.request().query(historyQuery);
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(result.recordset, null, 2),
          }],
        };

      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error executing ${name}: ${error.message}\n\nStack trace:\n${error.stack}`,
          }],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('SQL Server MCP server running on stdio');
  }
}

const server = new SqlServerMCPServer();
server.run().catch(console.error);