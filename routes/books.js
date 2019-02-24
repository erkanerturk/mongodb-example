var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

// Models
const Book = require('../models/Book');

router.post('/', function(req, res) {
  const book = new Book({
    title: 'Python',
    comments: [{ message: 'Amazing' }],
    category: 'Story',
    meta: {
      votes: 5,
      favs: 2,
    },
    published: false,
  });

  book.save((err, data) => {
    err ? res.json(err) : res.json(data);
  });
});

router.get('/search', (req, res) => {
  Book.find(
    {
      // published değeri false olanları getirir
      published: false,
      // category alanı dolu olanları getirir
      category: {
        $exists: true,
      },
    },
    'comments title meta.favs',
    (err, data) => res.json(data),
  );
});

router.get('/filter', (req, res) => {
  Book.find({ published: false }, 'comments title meta.favs', (err, data) => res.json(data))
    .sort({ 'meta.favs': 1 }) // Küçükten büyüğe sıralar
    .skip(2) // İlk 2 kayıdı atlar
    .limit(2); // 2 kayıt döner
});

router.get('/searchById', (req, res) => {
  Book.findById('5c71879d98ed14b5b9179a31', 'comments title publishedAt', (err, data) =>
    res.json(data),
  );
});

router.put('/update', (req, res) => {
  Book.update(
    {
      published: false,
    },
    {
      published: true,
      // Array içine yeni veriyi ekler
      $push: {
        comments: 'Test',
      },
      // Key'in adını değiştirir
      // $rename: {
      //   meta: 'newMeta',
      // },

      // Alanı siler
      // $unset: {
      //   meta: '',
      // },
    },
    {
      multi: true, // Bir veriyi değil tüm verilerde güncelle
      // upsert: true, //  Koşula uygun kayıt bulamazsa, yeni kayıt ekler
    },
    (err, data) => res.json(data),
  );
});

router.delete('/remove', (req, res) => {
  Book.remove({ published: true, title: 'Python' }, (err, data) => res.json(data));
});

// Kümeleme işlemi
router.get('/aggregate', (req, res) => {
  Book.aggregate(
    [
      {
        // Değeri eşleşen
        $match: {
          published: true,
        },
      },
      // {
      //   // Kategorı için aynı değerleri toplar
      //   $group: {
      //     _id: '$category',
      //     total: { $sum: 1 },
      //   },
      // },
      {
        // Sadece istenilen alanları getirir
        $project: {
          title: true,
        },
      },
      {
        // Sıralama yapar
        $sort: {
          title: -1,
        },
      },
      {
        $skip: 1,
      },
      {
        $limit: 2,
      },
    ],
    (err, data) => res.json(data),
  );
});

// Collectionlar arası ilişki
router.get('/aggregate-lookup', (req, res) => {
  Book.aggregate(
    [
      {
        $match: {
          // id bazlı eşleme yapar
          _id: mongoose.Types.ObjectId('5c71879d98ed14b5b9179a31'),
        },
      },
      {
        $lookup: {
          // Hangi collection ile eşleşeceği
          from: 'users',
          // Kimin eşleşeceği
          localField: 'userId',
          // Diğer collection da kiminle eşleşeceği
          foreingField: '_id',
          // Değerin hangi değişkene atanacağı
          as: 'user',
        },
      },
      {
        //  as: ile oluşturduğumuz alanı tanımlar
        $unwind: '$user',
      },
      {
        $project: {
          title: true,
          username: '$user.fullname',
        },
      },
    ],
    (err, data) => res.json(data),
  );
});

module.exports = router;
