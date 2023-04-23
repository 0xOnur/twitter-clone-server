import express from "express";
import multer from "multer";



const tweetRoutes = express.Router();
const upload = multer({storage: multer.diskStorage({})});

//http://localhost:5000/tweet
tweetRoutes.get('/', (req, res) => {
    res.status(200).send('tweet page');
});


export default tweetRoutes;