const http = require('http');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',        
    password: 'Password@1234',       
    database: 'health_data31'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err); 
    } else {
        console.log('MySQL connected...');
    }
});

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Welcome to the Patient Data API' }));

    } else if (req.url === '/api/patient-states' && req.method === 'GET') {
        db.query('SELECT state, COUNT(*) AS count FROM patients GROUP BY state', (error, results) => {
            if (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(results));
            }
        });

    } else if (req.url.startsWith('/api/patients-by-gender-age?state=') && req.method === 'GET') {
        const state = decodeURIComponent(req.url.split('=')[1]);
        db.query(
            'SELECT gender, age, COUNT(*) AS count FROM patients WHERE state = ? GROUP BY gender, age',
            [state],
            (error, results) => {
                if (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Database error' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(results));
                }
            }
        );
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
});

server.listen(3000, () => console.log('Server running on http://localhost:3000'));
