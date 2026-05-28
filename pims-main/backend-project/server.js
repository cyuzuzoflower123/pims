const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db.js');
const app = express();
const api = express.Router();
const port = 3000;

const session = require('express-session');
const cors = require('cors');

const corsOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://web.postman.co',
    'https://app.postman.com',
]);

app.use(cors({
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true);
        }
        if (corsOrigins.has(origin)) {
            return callback(null, true);
        }
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
}));

app.use(express.json());

app.use(session({
    secret: 'password',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false
    }
}));

async function createUser(req, res) {
    const { username, password } = req.body;
    const sql = 'INSERT INTO users(username,password)VALUES(?,?)';
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(sql, [username, hashedPassword]);

        res.status(201).json({ message: 'user created' });
    } catch (err) {
        console.error('create user error:', err);
        res.status(500).json({ error: 'error when creating' });
    }
}

async function getUser(req, res) {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username=?';
    try {
        const [rows] = await db.execute(sql, [username]);
        if (!rows.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        res.status(200).json([{ userId: user.userId, username: user.username }]);
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Retrieving error' });
    }
}

async function login(req, res) {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username=?';
    try {
        const [rows] = await db.execute(sql, [username]);
        if (rows.length > 0) {
            const user = rows[0];
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.session.user = {
                    id: user.userId,
                    username: user.username
                };
                res.status(200).json({
                    message: 'Login successful',
                    user: req.session.user
                });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'DB error' });
    }
}

function sessionUser(req, res) {
    if (req.session.user) {
        return res.json({ user: req.session.user });
    }
    res.status(401).json({ error: 'Unauthorized' });
}

async function getCategories(req, res) {
    try {
        const [rows] = await db.execute(
            'SELECT * FROM category ORDER BY catId'
        );
        res.json(rows);
    } catch (err) {
        console.error('getCategories:', err);
        res.status(500).json({ error: 'Failed to list categories' });
    }
}

async function updateCategory(req, res) {
    const id = req.params.id;
    const { storageInstructions, AverageTaxRate } = req.body;
    try {
        await db.execute(
            'UPDATE category SET storageInstructions=?, AverageTaxRate=? WHERE catId=?',
            [storageInstructions, AverageTaxRate, id]
        );
        res.json({ message: 'Category updated' });
    } catch (err) {
        console.error('updateCategory:', err);
        res.status(500).json({ error: 'Failed to update category' });
    }
}

async function deleteCategory(req, res) {
    const id = req.params.id;
    try {
        await db.execute('DELETE FROM category WHERE catId=?', [id]);
        res.json({ message: 'Category deleted' });
    } catch (err) {
        console.error('deleteCategory:', err);
        res.status(500).json({ error: 'Failed to delete category' });
    }
}

async function category(req, res) {
    const { storageInstructions, AverageTaxRate } = req.body;
    const sql = `
        INSERT INTO category(storageInstructions,AverageTaxRate)
        VALUES(?, ?)
    `;
    try {
        await db.execute(sql, [storageInstructions, AverageTaxRate]);
        res.status(200).json({ message: 'Added to category' });
    } catch (err) {
        console.error('category error:', err);
        res.status(500).json({ error: 'Error when adding category' });
    }
}

async function getMedicines(req, res) {
    try {
        const [rows] = await db.execute(`
            SELECT m.*, c.storageInstructions AS categoryName
            FROM medicine m
            LEFT JOIN category c ON c.catId = m.catId
            ORDER BY m.medId
        `);
        res.json(rows);
    } catch (err) {
        console.error('getMedicines:', err);
        res.status(500).json({ error: 'Failed to list medicines' });
    }
}

async function updateMedicine(req, res) {
    const id = req.params.id;
    const { TradeName, GenericName, UnitPrice, catId } = req.body;
    try {
        await db.execute(
            'UPDATE medicine SET TradeName=?, GenericName=?, UnitPrice=?, catId=? WHERE medId=?',
            [TradeName, GenericName, UnitPrice, catId, id]
        );
        res.json({ message: 'Medicine updated' });
    } catch (err) {
        console.error('updateMedicine:', err);
        res.status(500).json({ error: 'Failed to update medicine' });
    }
}

async function deleteMedicine(req, res) {
    const id = req.params.id;
    try {
        await db.execute('DELETE FROM medicine WHERE medId=?', [id]);
        res.json({ message: 'Medicine deleted' });
    } catch (err) {
        console.error('deleteMedicine:', err);
        res.status(500).json({ error: 'Failed to delete medicine' });
    }
}

async function medicine(req, res) {
    const { TradeName, GenericName, UnitPrice, catId } = req.body;
    const sql = `
        INSERT INTO medicine
        (TradeName,GenericName,UnitPrice,catId)
        VALUES (?, ?, ?, ?);
    `;
    try {
        await db.execute(sql, [TradeName, GenericName, UnitPrice, catId]);
        res.status(200).json({ message: 'medicine added' });
    } catch (err) {
        console.error('medicine error:', err);
        res.status(500).json({ error: 'Failed to add medicine' });
    }
}

async function getInventory(req, res) {
    try {
        const [rows] = await db.execute(`
            SELECT i.*, m.TradeName, m.GenericName, m.UnitPrice
            FROM InventoryStock i
            INNER JOIN medicine m ON m.medId = i.medId
            ORDER BY i.expiryDate ASC
        `);
        res.json(rows);
    } catch (err) {
        console.error('getInventory:', err);
        res.status(500).json({ error: 'Failed to list inventory' });
    }
}

async function InventoryStock(req, res) {
    const { medId, QuantityInHand, expiryDate } = req.body;
    const sql = `
        INSERT INTO  InventoryStock
        (medId,QuantityInHand,expiryDate)
        VALUES (?, ?, ?)
    `;
    try {
        await db.execute(sql, [medId, QuantityInHand, expiryDate]);
        res.status(200).json({ message: 'Added to stock' });
    } catch (err) {
        console.error('stock error:', err);
        res.status(500).json({ error: 'Error when adding stock' });
    }
}

async function getSales(req, res) {
    try {
        const [rows] = await db.execute(`
            SELECT s.*, m.TradeName, m.UnitPrice
            FROM sales s
            INNER JOIN medicine m ON m.medId = s.medId
            ORDER BY s.saleDate DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error('getSales:', err);
        res.status(500).json({ error: 'Failed to list sales' });
    }
}

async function dailyReport(req, res) {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    try {
        const [rows] = await db.execute(
            `
            SELECT m.TradeName,
                   SUM(s.quantitySold) AS QuantitySold,
                   COALESCE((
                       SELECT SUM(i.QuantityInHand)
                       FROM InventoryStock i
                       WHERE i.medId = m.medId
                   ), 0) AS RemainingStock
            FROM sales s
            INNER JOIN medicine m ON m.medId = s.medId
            WHERE DATE(s.saleDate) = ?
            GROUP BY m.medId, m.TradeName
            ORDER BY m.TradeName
            `,
            [date]
        );
        res.json({ date, rows });
    } catch (err) {
        console.error('dailyReport:', err);
        res.status(500).json({ error: 'Failed to build report' });
    }
}

async function sales(req, res) {
    const { medId, quantitySold, totalAmount, saleDate } = req.body;
    const sql = `
        INSERT INTO sales
        (medId,quantitySold,totalAmount,saleDate)
        VALUES (?, ?, ?,?)`;
    try {
        await db.execute(sql, [medId, quantitySold, totalAmount, saleDate]);
        try {
            await db.execute(
                `UPDATE InventoryStock
                 SET QuantityInHand = GREATEST(0, QuantityInHand - ?)
                 WHERE medId = ?
                 ORDER BY expiryDate ASC
                 LIMIT 1`,
                [quantitySold, medId]
            );
        } catch (stockErr) {
            console.warn('Stock decrement skipped:', stockErr.message);
        }
        res.status(200).json({ message: 'Added to sale' });
    } catch (err) {
        console.error('Sale error:', err);
        res.status(500).json({ error: 'Error when adding sale' });
    }
}

async function logout(req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Could not logout' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
}

app.post('/users', createUser);
app.post('/getuser', getUser);
app.post('/login', login);
app.get('/session', sessionUser);
app.post('/logout', logout);

app.get('/categories', getCategories);
app.post('/category', category);
app.put('/category/:id', updateCategory);
app.delete('/category/:id', deleteCategory);

app.get('/medicines', getMedicines);
app.post('/medicine', medicine);
app.put('/medicine/:id', updateMedicine);
app.delete('/medicine/:id', deleteMedicine);

app.get('/inventory', getInventory);
app.post('/stock', InventoryStock);

app.get('/sales', getSales);
app.post('/sales', sales);

app.get('/report/daily', dailyReport);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
