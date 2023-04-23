import express from "express";
import multer from "multer";



const userRoutes = express.Router();
const upload = multer({storage: multer.diskStorage({})});
//http://localhost:5000/users

userRoutes.get('/', (req, res) => {
    res.status(200).send('user page');
});


export default userRoutes;