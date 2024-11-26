const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Client } = require('pg');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

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

app.get('/produtos', async (req, res) => {
  try {
    const result = await client.query('SELECT id, nome, preco, descricao FROM produtos');
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar produtos' });
  }
});


app.post('/login', async (req, res) => {
    console.log(req.body);
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

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
