# Database Connection Setup Guide

This guide will help you connect the chatbot to your e-commerce database (MySQL, PostgreSQL, or MongoDB) to fetch real-time product, order, and inventory data.

## Prerequisites

1. **Database Access**: You need:
   - Database host/URL
   - Port number
   - Username and password
   - Database name
   - Network access (if database is remote)

2. **Database Tables**: Your database should have tables/collections for:
   - Products (with fields like: id, sku, name, price, stock/inventory)
   - Orders (with fields like: id, status, customer_id, created_at)
   - Inventory (optional, with fields like: sku, quantity)

## Step-by-Step Setup

### Method 1: Using the Setup Wizard (Recommended)

1. **Start the Backend Server**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access the Setup Wizard**:
   - Open your browser: `http://localhost:3000/admin/setup-wizard`
   - Fill in your database details:
     - **Database Type**: Select MySQL, PostgreSQL, or MongoDB
     - **Host**: Your database host (e.g., `localhost` or `db.example.com`)
     - **Port**: 
       - MySQL: `3306`
       - PostgreSQL: `5432`
       - MongoDB: `27017`
     - **User**: Your database username
     - **Password**: Your database password
     - **Database**: Your database name
   - Click **"Test Connection"**
   - If successful, proceed to map your tables

4. **Map Your Tables** (Step 2):
   - The system will auto-detect your schema
   - Map which table contains:
     - Products
     - Orders
     - Users/Customers
   - Click **"Save Configuration"**

### Method 2: Using Environment Variables

1. **Create `backend/.env` file**:
   ```bash
   # Database Configuration
   DB_TYPE=mysql          # or 'postgres' or 'mongodb'
   DB_HOST=localhost
   DB_PORT=3306          # 5432 for PostgreSQL, 27017 for MongoDB
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database
   ```

2. **Test the Connection**:
   ```bash
   cd backend
   npm run setup
   ```
   Follow the prompts to test your connection.

3. **Start the Server**:
   ```bash
   npm run dev
   ```

### Method 3: Using the CLI Setup Script

1. **Run the Setup Script**:
   ```bash
   cd backend
   npm run setup
   ```

2. **Follow the Prompts**:
   ```
   DB type (mysql/postgres/mongodb): mysql
   Host (default: localhost): localhost
   Port: 3306
   User: root
   Password: ******
   Database name: my_shop_db
   ```

3. **Connection Test**:
   - The script will test the connection
   - If successful, configuration is saved

## Database-Specific Setup

### MySQL Setup

**Example `.env`**:
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=mypassword
DB_NAME=shop_db
```

**Required Tables** (example structure):
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sku VARCHAR(50) UNIQUE,
  name VARCHAR(255),
  price DECIMAL(10,2),
  stock INT
);

CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  status VARCHAR(50),
  customer_id INT,
  created_at TIMESTAMP
);
```

### PostgreSQL Setup

**Example `.env`**:
```env
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=mypassword
DB_NAME=shop_db
```

**Required Tables** (example structure):
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) UNIQUE,
  name VARCHAR(255),
  price DECIMAL(10,2),
  stock INTEGER
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  status VARCHAR(50),
  customer_id INTEGER,
  created_at TIMESTAMP
);
```

### MongoDB Setup

**Example `.env`**:
```env
DB_TYPE=mongodb
DB_HOST=localhost
DB_PORT=27017
DB_USER=myuser
DB_PASSWORD=mypassword
DB_NAME=shop_db
```

**Required Collections** (example documents):
```javascript
// products collection
{
  _id: ObjectId("..."),
  sku: "PROD-001",
  name: "Product Name",
  price: 29.99,
  stock: 100
}

// orders collection
{
  _id: ObjectId("..."),
  status: "pending",
  customer_id: 123,
  created_at: ISODate("...")
}
```

## Remote Database Connection

If your database is hosted remotely (AWS RDS, Azure, etc.):

1. **Allow Your IP**:
   - Add your server's IP to the database firewall/security group

2. **Use SSL** (if required):
   - Update the adapter code to include SSL options
   - Example for MySQL:
     ```typescript
     mysql.createPool({
       // ... other config
       ssl: { rejectUnauthorized: false }
     })
     ```

3. **Update `.env`**:
   ```env
   DB_HOST=your-remote-host.amazonaws.com
   DB_PORT=3306
   ```

## Testing the Connection

### Test via API:
```bash
curl -X POST http://localhost:4000/api/setup/test-connection \
  -H "Content-Type: application/json" \
  -d '{
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "password",
    "database": "shop_db"
  }'
```

### Test via Health Check:
```bash
curl http://localhost:4000/health
```

## Common Issues & Solutions

### 1. "Connection Refused"
- **Check**: Database server is running
- **Solution**: Start MySQL/PostgreSQL/MongoDB service
- **For Windows**: Check Services, for Linux: `sudo systemctl status mysql`

### 2. "Access Denied"
- **Check**: Username and password are correct
- **Solution**: Verify credentials, check user permissions

### 3. "Database Not Found"
- **Check**: Database name is correct
- **Solution**: Create the database or use correct name

### 4. "Can't Connect to Remote Database"
- **Check**: Firewall rules, network access
- **Solution**: Allow your IP in database security group

### 5. "Port Already in Use" (Backend)
- **Check**: Another process using port 4000
- **Solution**: 
  ```bash
   # Windows
   netstat -ano | findstr :4000
   taskkill /PID <PID> /F
   
   # Or change PORT in .env
   PORT=4001
   ```

## Table Mapping

After connecting, you need to map your tables. The chatbot expects:

- **Products Table**: Contains product information
  - Required fields: `id`, `sku` (or similar), `name`, `price`, `stock` (or `inventory`)
  
- **Orders Table**: Contains order information
  - Required fields: `id`, `status`
  
- **Users/Customers Table** (optional): For customer queries
  - Fields: `id`, `email`, `name`

The setup wizard will auto-detect your schema and suggest mappings.

## Next Steps

After successful connection:

1. **Upload FAQs**: Go to `/admin/faq-manager` and upload your FAQ files
2. **Test Queries**: Ask the chatbot about products, orders, etc.
3. **Monitor**: Check `/admin/analytics` for query statistics

## Production Deployment

For production:

1. **Use Environment Variables**: Never commit `.env` files
2. **Use Connection Pooling**: Already configured in adapters
3. **Monitor Connections**: Check database connection limits
4. **Use SSL**: Enable SSL for remote databases
5. **Backup**: Regular database backups

## Support

If you encounter issues:
1. Check the backend logs: `npm run dev` output
2. Verify database credentials
3. Test connection using database client (MySQL Workbench, pgAdmin, etc.)
4. Check network connectivity

---

**Ready to use!** Once connected, the chatbot can fetch real-time data from your database to answer customer queries about products, orders, and inventory.

