import jwt from 'jsonwebtoken';


export const generateToken = (userId: string) => {
  try {
    const accessToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_TOKEN_LIFE });
    const refreshToken = jwt.sign({ _id: userId }, process.env.JWT_REFRESH_TOKEN_SECRET!, { expiresIn: process.env.JWT_REFRESH_TOKEN_LIFE });
    
    const log = {
      status: 'Logged in',
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
    console.log(log);

    return {
      accessToken,
      refreshToken,
    };
  } catch (error:any) {
    console.log(error.message);
  }
};

export const updateToken = (userId: string) => {
  try {
    const accessToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_TOKEN_LIFE });
    const log = {
      status: 'Update accessToken',
      accessToken: accessToken,
    };
    console.log(log);

    return {
      accessToken,
    };
  } catch (error) {
    
  }
}