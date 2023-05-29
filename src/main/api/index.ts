import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_, res) => {
  res.send('Hello World!');
});

app.listen(3000 || process.env.PORT, () => {
  console.log('Server started on port 3000!');
});
