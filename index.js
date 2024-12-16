const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Créer une nouvelle base de données en mémoire
const db = new sqlite3.Database('data.sqlite');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Créer une table
db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS users (Nom TEXT UNIQUE, Temps INTEGER)');
});

// Insérer des données
app.post('/user', (req, res) => {
    const { Nom, Temps } = req.body;

    if (!Nom || !Temps) {
        return res.status(400).send('Nom et Temps sont requis !');
    }

    const stmt = db.prepare('INSERT OR REPLACE INTO users (Nom, Temps) VALUES (?, ?)');
    stmt.run(Nom, Temps, function(err) {
        if (err) {
            console.error('Erreur d\'inserction:', err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(201).send('Utilisateur ajouté ou mis à jour avec succès');
    });
    stmt.finalize();
});

// Lire des données
app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            console.error('Erreur lecture des données :', err);
            return res.status(500).send('Erreur serveur');
        }
        res.status(200).json(rows);
    });
});

// Fermer la base de données
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Erreur lors de la fermeture de la bd :', err);
        }
        console.log('Bd fermée avec succès');
        process.exit(0);
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Le serveur est accessible sur le port : ${port}`);
});