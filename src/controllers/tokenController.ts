import jwt from 'jsonwebtoken';

interface Tokens {
  [userId: string]: {
    status: string;
    accessToken: string;
    refreshToken: string;
  };
}

const userTokens: Tokens = {};
console.log('refreshTokens: ', userTokens);

const time = Date.now();

export const generateToken = (userId: string) => {
  try {
    const accessToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_TOKEN_LIFE });
    const refreshToken = jwt.sign({ _id: userId }, process.env.JWT_REFRESH_TOKEN_SECRET!, { expiresIn: process.env.JWT_REFRESH_TOKEN_LIFE });
    const response = {
      status: 'Logged in',
      accessToken,
      refreshToken,
    };
    userTokens[userId] = response;

    console.log(userTokens);
    return {
      accessToken,
      refreshToken,
    };
  } catch (error:any) {
    console.log(error.message);
  }
};

export const updateToken = (userId: string, refreshToken: string) => {
  try {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET!);
    if (refreshToken && refreshToken === userTokens[userId].refreshToken) {
      const accessToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_TOKEN_LIFE,
      });
      const response = {
        status: `Updated accessToken at ${time}`,
        accessToken,
        refreshToken,
      };
      userTokens[userId] = response;
      return {
        accessToken,
        refreshToken,
      };
    } else {
      return 'Refresh token is not valid';
    }
  } catch (error:any) {
    return error.message;
  }
};


export const deleteToken = (userId: string) => {
  try {
    if (userId && userId in userTokens) {
      delete userTokens[userId];
      console.log(`Token removed successfully for ${userId}`)
    } else {
      console.log("Token is not valid")
    }
  } catch (error: any) {
    return error.message;
  }
};