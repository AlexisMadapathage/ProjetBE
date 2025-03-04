const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = async (req, res, next) => {
    try {
        console.log("Requête reçue :", req.body, req.file);
        
        // Vérifie si les données sont envoyées sous forme de JSON stringifié (`book`)
        if (!req.body.book) {
            return res.status(400).json({ message: "Données manquantes dans la requête" });
        }

        const bookObject = JSON.parse(req.body.book);
        delete bookObject._id; 
        delete bookObject._userId;

        if (!req.file) {
            return res.status(400).json({ message: "Image requise" });
        }

        // 🔥 Remplace `year` par `publishDate`
        bookObject.publishDate = bookObject.year; 
        delete bookObject.year; // Supprime `year` pour éviter des conflits

          const book = new Book({
            ...bookObject,
            userId: req.auth.userId,
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });

        console.log("Livre prêt à être enregistré :", book);

        await book.save();

        res.status(201).json({ message: 'Livre enregistré !' });

    } catch (error) {
        console.error("Erreur lors de la création du livre :", error);
        res.status(400).json({ message: "Erreur lors de l'enregistrement en base de données", error });
    }
};


exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(400).json({ message : 'Non-autorisé' });
            }  else {
                Book.updateOne({_id: req.params.id}, {... bookObject, _id: req.params.id })
                .then(() => res.status(200).json({ message : 'Livre modifié !' }))
                .catch(error => { res.status(401).json({ error })});
            }
        })
        .catch((error) => { res.status(400).json({ error })})
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
    .then(book => {
        if (book.userId != req.auth.userId) {
            res.status(401).json({ message: 'Non-autorisé' })
        } else  {
            const filename = book.imageUrl.split('/images')[1];
            fs.unlink(`images/${filename}`, () => {
                Book.deleteOne({_id: req.params.id})
                .then(() => res.status(200).json({ message : 'Livre supprimé !' }))
                .catch(error => { res.status(401).json({ error })})
            });      

        }
    })
    .catch((error) => { res.status(500).json({ error })})
}; 

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then(books => res.status(200).json(books))
        .catch(error => res.status(400).json({ error }));
};

exports.rateBook = async (req, res) => {
    try {
        console.log("Requête reçue :", req.body, "Params:", req.params);
        
        const { rating, userId } = req.body; // Le frontend envoie "rating" et "userId"
        const bookId = req.params.id; // Vérifie si l'ID du livre est bien transmis

        if (!bookId) {
            console.error("Erreur : ID du livre manquant !");
            return res.status(400).json({ message: "ID du livre manquant dans la requête" });
        }

        if (!rating) {
            console.error("Erreur : Note manquante !");
            return res.status(400).json({ message: "Note (rating) manquante dans la requête" });
        }

        if (!userId) {
            console.error("Erreur : User ID manquant !");
            return res.status(400).json({ message: "User ID manquant dans la requête" });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: "Livre non trouvé." });
        }

        // Vérifier si l'utilisateur a déjà noté ce livre
        const existingRating = book.ratings.find(r => r.userId.toString() === userId);
        if (existingRating) {
            return res.status(400).json({ message: "Vous avez déjà noté ce livre." });
        }

        // Ajouter la nouvelle note (transformer "rating" en "grade")
        book.ratings.push({ userId, grade: Number(rating) });

        // Recalculer la moyenne
        const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
        book.averageRating = Number((total / book.ratings.length).toFixed(1));

        await book.save();
        res.status(201).json({ message: "Note ajoutée avec succès !", book });

    } catch (error) {
        console.error("Erreur lors de l'ajout de la note :", error);
        res.status(500).json({ error: "Une erreur est survenue." });
    }
};

exports.getBestRatedBooks = async (req, res) => {
    try {
      const books = await Book.find().sort({ averageRating: -1 }).limit(3);
      res.status(200).json(books);
    } catch (error) {
      console.error("Erreur lors de la récupération des livres les mieux notés :", error);
      res.status(500).json({ message: "Erreur serveur." });
    }
  };
  