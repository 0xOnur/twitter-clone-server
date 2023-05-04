import { Request, Response } from "express";
import User from "../schemas/user.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import {generateToken, updateToken} from "./tokenController"


// Avatar Options for cloudinary
const avatarOptions = {
    use_filename: true,
    folder: "Twitter/Users/Avatar",
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
    quality: "auto:eco",
}

export const createUser = async (req:Request, res:Response) => {
    try {
        console.log(req.file);
        console.log(req.body);

        const emailRegex = /^\S+@\S+\.\S+$/;
        const isValid = emailRegex.test(req.body.email);
        if (!isValid) {
            res.status(400).json({message: "Email is not valid"});
            return;
        }

        const user = new User({
            username: req.body.username,
            displayName: req.body.displayName,
            email: req.body.email,
            password: req.body.password,
            bio: req.body.bio,
            isVerified: false,
        })

        await user.validate()

        if(req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, avatarOptions)
            user.avatar = result.secure_url;
            user.avatarId = result.public_id;
        }

        await user.save()
        const tokens = generateToken(user._id);
        res.status(201).json({user, tokens});
        
    } catch (error: any) {
        if (error.name === "ValidationError") {
          res.status(400).json({ message: "Validation Error", errors: error.errors });
        } else {
          res.status(500).json({ message: error.message });
        }
      }
    };

// Check username is taken
export const usernameIsAvailable = async (req:Request, res:Response) => {
    try {
        console.log(req.params);
        const user = await User.findOne({username: req.params.username});
        if (user) {
            res.status(200).send(false);
        } else {
            res.status(200).send(true);
        }
    } catch (error:any) {
        res.status(500).json({message: error.message});
    }
}

// Check email is taken and valid format
export const emailIsAvailable = async (req:Request, res:Response) => {
    try {
        console.log(req.params);
        const emailRegex = /^\S+@\S+\.\S+$/;
        const isValid = emailRegex.test(req.params.email);
        const user = await User.findOne({email: req.params.email});
        if (user || !isValid) {
            res.status(200).send(false);
        } else {
            res.status(200).send(true);
        }
    }
    catch (error:any) {
        res.status(500).json({message: error.message});
    }
}