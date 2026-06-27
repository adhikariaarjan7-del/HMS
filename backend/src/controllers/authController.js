import bcrypt from "bcryptjs";
import { User, Patient } from "../models/index.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../config/jwt.js";
import { ROLES, HTTP, JWT, BCRYPT_SALT_ROUNDS } from "../constants.js";

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  samesite: "strict",
  maxAge: JWT.COOKIE_MAX_AGE_MS,
};
const buildUserPayload = (user, profile = null) => ({
  id: user.id,
  role: user.role,
  identifier: user.identifier,
  name: profile?.fullname ?? user.identifier,
});
export const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, dob, bloodGroup } = req.body;

    if (!fullName || !email || !password || !phone || !dob) {
      return res
        .status(HTTP.BAD_REQUEST)
        .json({ message: "All Fields are required" });
    }
    if (password.length < 8) {
      return res
        .status(HTTP.BAD_REQUEST)
        .json({ message: "Password  must be at least 8 characters" });
    }
    const existing = await User.findOne({
      where: { identifier: email.toLowerCase() },
    });
    if (existing) {
      return res
        .status(HTTP.CONFLICT)
        .json({ message: "Email Already Registered" });
    }
    const password_hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const user = await User.create({
      identifier: email.toLowerCase(),
      password_hash,
      role: ROLES.PATIENT,
    });
    await Patient.create({
      user_id: user.id,
      fullname: fullName,
      phone,
      dob,
      blood_group: bloodGroup || null,
    });
    return res.status(HTTP.CREATED).json({
      success: true,
      message: "Account created Succesfully",
    });
  } catch (err) {
    console.error("[register]", err);
    return res.status(HTTP.INTERNAL).json({ message: "Internal Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res
        .status(HTTP.BAD_REQUEST)
        .json({ message: "Email ,Password , and role are required" });
    }
    const user = await User.findOne({
      where: { identifier: email.toLowerCase() },
    });

    if (!user || !user.is_active) {
      return res
        .status(HTTP.UNAUTHORIZED)
        .json({ message: "Invalid Credentials" });
    }
    if (user.role !== role.toLowerCase()) {
      return res
        .status(HTTP.UNAUTHORIZED)
        .json({ message: "Invalid Credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(HTTP.UNAUTHORIZED)
        .json({ message: "Invalid Credentials" });
    }

    let profile = null;
    if (user.role === ROLES.PATIENT) {
      profile = await Patient.findOne({ where: { user_id: user.id } });
    }
    const tokenPayload = {
      id: user.id,
      role: user.role,
      token_version: user.refresh_token_version,
    };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    return res.status(HTTP.OK).json({
      success: true,
      accessToken,
      user: buildUserPayload(user, profile),
    });
  } catch (err) {
    console.error("[login]", err);
    return res.status(HTTP.INTERNAL).json({ message: "Internal server Error" });
  }
};
export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res
        .status(HTTP.UNAUTHORIZED)
        .json({ message: "No refresh token" });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.is_active) {
      return res.status(HTTP.UNAUTHORIZED).json({ message: "User not found" });
    }

    if (decoded.token_version !== user.refresh_token_version) {
      return res
        .status(HTTP.UNAUTHORIZED)
        .json({ message: "Token has been revoked" });
    }

    const tokenPayload = {
      id: user.id,
      role: user.role,
      token_version: user.refresh_token_version,
    };
    const newAccessToken = signAccessToken(tokenPayload);

    return res
      .status(HTTP.OK)
      .json({ success: true, accessToken: newAccessToken });
  } catch {
    return res
      .status(HTTP.UNAUTHORIZED)
      .json({ message: "Invalid or expired refresh token" });
  }
};

export const logout = async (req, res) => {
  try {
    await User.increment("refresh_token_version", {
      where: { id: req.user.id },
    });

    res.clearCookie("refreshToken", cookieOpts);
    return res.status(HTTP.OK).json({ success: true, message: "Logged out" });
  } catch (err) {
    console.error("[logout]", err);
    return res.status(HTTP.INTERNAL).json({ message: "Server error" });
  }
};
