import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import userRoutes from './routes/user';
import tweetRoutes from './routes/tweet';
import pollRoutes from './routes/poll';

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: 'cross-origin'}));
app.use(morgan("common"));
app.use(cors({credentials: true, origin: "http://localhost:3000"}));

app.use('/user',userRoutes);
app.use('/tweet', tweetRoutes);
app.use('/poll', pollRoutes);

app.get('/', (req, res) => {
    res.status(200).send('Hello World!');
});

const PORT = process.env.PORT || 5000;
mongoose.set("strictQuery", false);
mongoose.connect(String(process.env.CONNECTION_URL)).then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on: http://localhost:${PORT}`);
    });
}).catch((error) => {
    console.log(error.message);
});