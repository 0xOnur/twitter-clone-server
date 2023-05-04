import jwt, { JwtPayload } from 'jsonwebtoken';

interface Tokens {
  [refreshToken: string]: {
    status: string;
    accessToken: string;
    refreshToken: string;
  };
}

const refreshTokens: Tokens = {};
console.log('refreshTokens: ', refreshTokens);

export const generateToken = (userId: string) => {
  try {
    const accessToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_TOKEN_LIFE });
    const refreshToken = jwt.sign({ _id: userId }, process.env.JWT_REFRESH_TOKEN_SECRET!, { expiresIn: process.env.JWT_REFRESH_TOKEN_LIFE });
    const response = {
      status: 'Logged in',
      accessToken,
      refreshToken,
    };
    refreshTokens[refreshToken] = response;

    console.log(refreshTokens);
    return {
      accessToken,
      refreshToken,
    };
  } catch (error:any) {
    console.log(error.message);
  }
};

export const updateToken = (refreshToken: string) => {
  try {
    jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET!);
    if (refreshToken && refreshToken in refreshTokens) {
      const decoded = jwt.decode(refreshToken) as JwtPayload;
      const userId = decoded._id;
      const accessToken = jwt.sign({ _id: userId }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_TOKEN_LIFE,
      });
      const response = {
        status: 'Logged in',
        accessToken,
        refreshToken,
      };
      refreshTokens[refreshToken] = response;
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
