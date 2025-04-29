const express = require('express');
const bodyParser = require('body-parser');
const db = require('./connect_db');
const path = require('path');
const app = express();
app.use(bodyParser.json());

app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

app.post('/check-login', (req, res) => {
 const { phone_email } = req.body;
 if (!phone_email) {
   return res.status(400).json({ error: 'Thiếu phone_email' });
 }
 const sql = 'SELECT * FROM customers WHERE phone_email = ?';
 db.query(sql, [phone_email], (err, results) => {
   if (err) {
     return res.status(500).json({ error: 'Lỗi máy chủ' });
   }
   if (results.length === 0) {
     return res.status(200).json({ isLoggedIn: false });
   }
   return res.status(200).json({ isLoggedIn: true, user: results[0] });
 });
});

app.post('/login', (req, res) => {
 const { phone, password } = req.body;
 if (!phone || !password)
   return res.status(400).json({ error: 'Thiếu số điện thoại/email hoặc mật khẩu' });
 const sql = 'SELECT * FROM customers WHERE phone_email = ?';
 db.query(sql, [phone], (err, results) => {
   if (err) return res.status(500).json({ error: 'Lỗi máy chủ' });
   if (results.length === 0)
     return res.status(401).json({ error: 'Người dùng không tồn tại' });
   const user = results[0];
   if (user.password !== password)
     return res.status(401).json({ error: 'Mật khẩu không đúng' });
   return res.status(200).json({ message: 'Đăng nhập thành công', user });
 });
});

app.post('/register', (req, res) => {
 const { ho_ten, phone, password } = req.body;
 if (!ho_ten || !phone || !password)
   return res.status(400).json({ error: 'Thiếu thông tin đăng ký' });
 const checkSql = 'SELECT * FROM customers WHERE phone_email = ?';
 db.query(checkSql, [phone], (err, results) => {
   if (err) return res.status(500).json({ error: 'Lỗi máy chủ' });
   if (results.length > 0)
     return res.status(400).json({ error: 'Số điện thoại/email đã được đăng ký' });
   const insertSql = 'INSERT INTO customers (ho_ten, phone_email, password) VALUES (?, ?, ?)';
   db.query(insertSql, [ho_ten, phone, password], (err) => {
     if (err) return res.status(500).json({ error: 'Lỗi máy chủ khi đăng ký' });
     return res.status(200).json({ message: 'Đăng ký thành công' });
   });
 });
});

app.post('/reset-password', (req, res) => {
 const { phone, newPassword } = req.body;
 if (!phone || !newPassword)
   return res.status(400).json({ error: 'Thiếu số điện thoại/email hoặc mật khẩu mới' });
 const checkSql = 'SELECT * FROM customers WHERE phone_email = ?';
 db.query(checkSql, [phone], (err, results) => {
   if (err) return res.status(500).json({ error: 'Lỗi máy chủ' });
   if (results.length === 0)
     return res.status(400).json({ error: 'Số điện thoại/email không tồn tại' });
   const updateSql = 'UPDATE customers SET password = ? WHERE phone_email = ?';
   db.query(updateSql, [newPassword, phone], (err) => {
     if (err)
       return res.status(500).json({ error: 'Lỗi máy chủ khi đổi mật khẩu' });
     return res.status(200).json({ message: 'Đổi mật khẩu thành công' });
   });
 });
});

app.post('/update-profile', (req, res) => {
 const {
   phone_email,
   ho_ten,
   gioi_tinh,
   ngay_sinh,
   so_dien_thoai,
   email,
   tinh,
   quan,
   phuong,
   dia_chi,
 } = req.body;
 if (!phone_email)
   return res.status(400).json({ error: 'Thiếu thông tin định danh (phone_email)' });
 const updateSql =
   'UPDATE customers SET ho_ten = ?, gioi_tinh = ?, ngay_sinh = ?, so_dien_thoai = ?, email = ?, tinh = ?, quan = ?, phuong = ?, dia_chi = ? WHERE phone_email = ?';
 db.query(
   updateSql,
   [ho_ten, gioi_tinh, ngay_sinh, so_dien_thoai, email, tinh, quan, phuong, dia_chi, phone_email],
   (err, results) => {
     if (err)
       return res.status(500).json({ error: 'Lỗi máy chủ khi cập nhật thông tin' });
     return res.status(200).json({ message: 'Cập nhật thông tin thành công' });
   }
 );
});

app.get('/services', (req, res) => {
 const customerId = req.query.customerId;
 if (!customerId) {
   return res.status(400).json({ error: 'Thiếu customerId' });
 }
 const sql = 'SELECT id, customer_id, title, description, content, CONCAT("https://mixmylook.store/", image_url) as image_url, status, created_at, warranty_type, warranty_duration FROM services WHERE customer_id = ? ORDER BY FIELD(status, "Đang xử lý", "Bàn giao", "Hoàn thành", "Bảo hành"), created_at DESC';
 db.query(sql, [customerId], (err, results) => {
   if (err) {
     console.error('Lỗi khi truy vấn dịch vụ:', err);
     return res.status(500).json({ error: 'Lỗi máy chủ' });
   }
   return res.status(200).json(results);
 });
});

app.post('/set-warranty', (req, res) => {
 const { service_id, warranty_type, warranty_duration } = req.body;
 if (!service_id || !warranty_type) {
   return res.status(400).json({ error: 'Thiếu service_id hoặc warranty_type' });
 }
 const sql = 'UPDATE services SET warranty_type = ?, warranty_duration = ?, status = ? WHERE id = ?';
 const status = warranty_type !== 'none' ? 'Bảo hành' : 'Hoàn thành';
 db.query(sql, [warranty_type, warranty_duration || null, status, service_id], (err) => {
   if (err) {
     console.error('Lỗi khi thiết lập bảo hành:', err);
     return res.status(500).json({ error: 'Lỗi máy chủ' });
   }
   return res.status(200).json({ message: 'Thiết lập bảo hành thành công' });
 });
});

// New endpoints for chat management
app.get('/customers', (req, res) => {
 const sql = 'SELECT id, ho_ten, gioi_tinh, ngay_sinh, so_dien_thoai, email FROM customers';
 db.query(sql, (err, results) => {
   if (err) {
     console.error('Lỗi khi truy vấn khách hàng:', err);
     return res.status(500).json({ error: 'Lỗi máy chủ' });
   }
   return res.status(200).json(results);
 });
});

app.get('/chat-messages', (req, res) => {
 const customerId = req.query.customerId;
 if (!customerId) {
   return res.status(400).json({ error: 'Thiếu customerId' });
 }
 const sql = 'SELECT id, customer_id, sender, content, content_type, created_at FROM chat_messages WHERE customer_id = ? ORDER BY created_at ASC';
 db.query(sql, [customerId], (err, results) => {
   if (err) {
     console.error('Lỗi khi truy vấn tin nhắn:', err);
     return res.status(500).json({ error: 'Lỗi máy chủ' });
   }
   return res.status(200).json(results);
 });
});

app.post('/send-message', (req, res) => {
 const { customer_id, content, content_type } = req.body;
 if (!customer_id || !content || !content_type) {
   return res.status(400).json({ error: 'Thiếu customer_id, content hoặc content_type' });
 }
 const sql = 'INSERT INTO chat_messages (customer_id, sender, content, content_type) VALUES (?, ?, ?, ?)';
 db.query(sql, [customer_id, 'ai', content, content_type], (err) => {
   if (err) {
     console.error('Lỗi khi gửi tin nhắn:', err);
     return res.status(500).json({ error: 'Lỗi máy chủ' });
   }
   return res.status(200).json({ message: 'Tin nhắn đã được gửi' });
 });
});

app.delete('/delete-chat', (req, res) => {
 const { customer_id } = req.body;
 if (!customer_id) {
   return res.status(400).json({ error: 'Thiếu customer_id' });
 }
 const sql = 'DELETE FROM chat_messages WHERE customer_id = ?';
 db.query(sql, [customer_id], (err) => {
   if (err) {
     console.error('Lỗi khi xóa đoạn chat:', err);
     return res.status(500).json({ error: 'Lỗi máy chủ' });
   }
   return res.status(200).json({ message: 'Đoạn chat đã được xóa' });
 });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log(`Server chạy trên cổng ${PORT}`);
});