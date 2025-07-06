const express = require('express');
const app = express();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mysecret123';

app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 直接服务 index.html 和 admin.html

let questions = []; // 内存存储（重启会丢失）

// 匿名提交问题
app.post('/api/questions', (req, res) => {
  const { q } = req.body;
  if (!q) return res.status(400).json({ error: '问题不能为空' });
  const entry = { id: uuidv4(), q, a: null };
  questions.push(entry);
  res.json({ success: true });
});

// 获取已回答的问答
app.get('/api/questions', (req, res) => {
  const answered = questions.filter(q => q.a);
  res.json(answered);
});

// 管理员获取全部问题（需密码）
app.get('/api/admin', (req, res) => {
  const pwd = req.query.pwd;
  if (pwd !== ADMIN_PASSWORD) return res.status(403).json({ error: '密码错误' });
  res.json(questions);
});

// 管理员提交回答
app.post('/api/answer', (req, res) => {
  const { id, a, pwd } = req.body;
  if (pwd !== ADMIN_PASSWORD) return res.status(403).json({ error: '密码错误' });

  const q = questions.find(q => q.id === id);
  if (!q) return res.status(404).json({ error: '问题未找到' });

  q.a = a;
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`匿名提问箱运行中：http://localhost:${PORT}`);
});
