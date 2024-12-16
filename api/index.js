const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');
const req = require('express/lib/request');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Conexão com o banco

const client = new Client({
  connectionString: 'postgresql://neondb_owner:jlrcsUn36dED@ep-sparkling-sound-a5rs1p32.us-east-2.aws.neon.tech/neondb?sslmode=require',
});

client.connect().then(() => {
  console.log('Conectado ao banco de dados!');
}).catch(err => {
  console.error('Erro ao conectar ao banco:', err);
});

app.get('/', (req, res) => {
  res.status(200).json('Servidor funcionando! Use /login para autenticação.');
});

// Login dos projetos

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await client.query(
      'SELECT * FROM usuarios WHERE usuario = $1 AND senha = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      res.status(200).json({ success: true, message: 'Login bem-sucedido!' });
    } else {
      res.status(401).json({ success: false, message: 'Usuário ou senha inválidos' });
    }
  } catch (error) {
    console.error('Erro na consulta ao banco:', error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
});

// Mercado APP

app.get('/produtos', async (req, res) => {
  try {
    const result = await client.query('SELECT id, nome, preco, descricao FROM produtos');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar produtos' });
  }
});

// arthurcerqueira.com.br

app.get('/links', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM links')
    res.json(result.rows)
  } catch (error) {
    console.error('Erro ao buscar links:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar links' });
  }
});

app.put('/links', async(req,res) => {
  const { id, pageUrl, pageName } = req.body;
  try {
    const result = await client.query(
      'UPDATE links SET pageName = $2, pageUrl = $3 WHERE id = $1',
      [id, pageName, pageUrl]
    );
  } catch (error) {
    console.error('Erro ao atualizar links:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar links' });
  }
});

app.post('/links', async(req,res) =>{
  try {
    const {id, pageName, pageUrl} = req.body
    const result = await client.query("SELECT * FROM link WHERE = $1", [id])
    if(result.rowCount <= 0){
      const result = await client.query('INSERT INTO links (pageName, pageUrl) Values($1,$2)',[pageName,pageUrl])
    }else{
      res.json(409).json({success: false, message: 'O link já existe'})
    }
  } catch (error) {
    console.error('Erro ao criar link:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar link' });
  }
})

module.exports = app; 
