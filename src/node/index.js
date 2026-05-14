const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const port = 5600;                                           

const cors = require("cors");
app.use(cors());

const { Pool } = require("pg");
const pool = new Pool({
  user: "user_5600", // PostgreSQLのユーザー名に置き換えてください
  host: "db", // PostgreSQLのホスト名に置き換えてください
  database: "crm_5600", // PostgreSQLのデータベース名に置き換えてください
  password: "pass_5600", // PostgreSQLのパスワードに置き換えてください
  port: 5432,
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("<h1>CRMサーバー稼働中</h1><p><a href='/customers'>顧客リストを表示する</a></p>");
});

app.get("/customers", async (req, res) => {
  try {
    const customerData = await pool.query("SELECT * FROM customers");
    res.send(customerData.rows);
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/add-customer", async (req, res) => {
  try {
    const { companyname, industry, contact, location } = req.body;
    const newCustomer = await pool.query(
      "INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4) RETURNING *",
      [companyname, industry, contact, location]
    );
    res.json({ success: true, customer: newCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.use(express.static("public"));
