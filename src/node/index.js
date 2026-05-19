const express = require("express");
const app = express();

const port = 5600;

const cors = require("cors");
app.use(cors());

// ミドルウェアの設定（ルーティングの前に記述）
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const { Pool } = require("pg");
const pool = new Pool({
  user: "user_5600",
  host: "db",
  database: "crm_5600",
  password: "pass_5600",
  port: 5432,
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
    res.status(500).send("Error " + err);
  }
});

app.get("/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const customerData = await pool.query("SELECT * FROM customers WHERE customer_id = $1", [id]);
    res.send(customerData.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error " + err);
  }
});

app.delete("/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM customers WHERE customer_id= $1", [id]);
    res.json({ success: true, message: `ID:${id} の顧客を削除しました。` });
  } catch (err) {
    console.error("サーバー側での削除エラー", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put("/customers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, industry, contact, location } = req.body;

    console.log("受け取ったデータ:", { id, company_name, industry, contact, location });

    await pool.query(
      "UPDATE customers SET company_name = $1, industry = $2, contact = $3, location = $4 WHERE customer_id = $5",
      [company_name, industry, contact, location, id]
    );

    res.json({ success: true, message: `ID:${id} を更新しました。` });
  } catch (err) {
    console.error("サーバー側での更新エラー:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/add-customer", async (req, res) => {
  try {
    const { company_name, industry, contact, location } = req.body;
    const newCustomer = await pool.query(
      "INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4) RETURNING *",
      [company_name, industry, contact, location]
    );
    res.json({ success: true, customer: newCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
