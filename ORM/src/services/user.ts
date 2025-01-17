import jwt from "jsonwebtoken";

class UserService {
  static decodeJWTToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your_jwt_secret"
      );
      return decoded;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

export default UserService;
