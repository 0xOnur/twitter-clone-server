import { Request, Response } from "express";
import User from "../schemas/user.schema";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";
import {generateToken, updateToken, deleteToken} from "./tokenController"


// Avatar Options for cloudinary
const avatarOptions = {
    use_filename: true,
    folder: "Twitter/Users/Avatar",
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
    quality: "auto:eco",
};


// Login User
export const LoginUser = async (req:Request, res:Response) => {
    try {
        console.log(req.body);
        
        const user = await User.findOne({username: req.body.username});
        if (!user) {
            res.status(404).json({message: "User not found"});
            return;
        }
        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordCorrect) {
            res.status(401).json({message: "Invalid password"});
            return;
        }
        const tokens = generateToken(user._id);
        res.status(200).json({user, tokens});
    } catch (error:any) {
        res.status(500).json({message: error.message});
    }
};


export const LogoutUser = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId;
        deleteToken(userId);
        res.status(200).json({message: "Logged out"});
    } catch (error: any) {
        res.status(500).json({message: error.message});        
    }
};

// Create a user
export const createUser = async (req: Request, res: Response) => {
    try {
        console.log(req.file);
        console.log(req.body);

        const emailRegex = /^\S+@\S+\.\S+$/;
        const isValid = emailRegex.test(req.body.email);
        if (!isValid) {
            res.status(400).json({ message: "Email is not valid" });
            return;
        };

        const user = new User({
            username: req.body.username,
            displayName: req.body.displayName,
            email: req.body.email,
            password: req.body.password,
            bio: req.body?.bio,
            isVerified: false,
            birthDay: {
                day: req.body?.birthDay?.day,
                month: req.body?.birthDay?.month,
                year: req.body?.birthDay?.year,
            }
        });

        await user.validate();

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, avatarOptions);
            user.avatar = result.secure_url;
            user.avatarId = result.public_id;
        }

        await user.save()
        const tokens = generateToken(user._id);
        res.status(201).json({ user, tokens });
    } catch (error: any) {
        if (error.name === "ValidationError") {
            res.status(400).json({ message: "Validation Error", errors: error.errors });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// Check username is Available
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
};

// Check email is Available with valid format
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
};


// Check username exist
export const usernameExist = async (req:Request, res:Response) => {
    try {
        console.log(req.params);
        const user = await User.findOne({username: req.params.username});
        if (user) {
            res.status(200).send(true);
        }else {
            res.status(200).send(false);
        }
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
};