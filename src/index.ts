import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import {v2 as cloudinary} from 'cloudinary';
import userRoutes from './routes/user';
import tweetRoutes from './routes/tweet';

/* CONFIGIRAIONS */
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API,
    api_secret: process.env.CLOUD_API_SECRET
});

const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({policy: 'cross-origin'}));
app.use(morgan("common"));
app.use(cors({credentials: true, origin: "http://localhost:3000"}));

app.use('/user',userRoutes);
app.use('/tweet', tweetRoutes);

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