import { Router } from "express";
import { User, Patient } from "../models/index.js";
import { authenticate, authorise } from "../middleware/auth.js";
import { ROLES, HTTP } from "../constants.js";

const router = Router();

// All routes here require a logged-in admin
router.use(authenticate, authorise(ROLES.ADMIN));

// GET users with roles /api/v1/hms/users
router.get("/", async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};

    const users = await User.findAll({
      where,
      attributes: { exclude: ["password_hash"] },
      include: [{ model: Patient, as: "patientProfile", required: false }],
      order: [["createdAt", "DESC"]],
    });

    return res.status(HTTP.OK).json({ success: true, users });
  } catch (err) {
    console.error("[users/list]", err);
    return res.status(HTTP.INTERNAL).json({ message: "Server error" });
  }
});

// see status use this /api/v1/hms/users/:id/toggle-status
router.patch("/:id/toggle-status", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res.status(HTTP.NOT_FOUND).json({ message: "User not found" });

    await user.update({ is_active: !user.is_active });
    return res
      .status(HTTP.OK)
      .json({ success: true, is_active: user.is_active });
  } catch (err) {
    console.error("[users/toggle]", err);
    return res.status(HTTP.INTERNAL).json({ message: "Server error" });
  }
});

// DELETE :(  use this /api/v1/hms/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res.status(HTTP.NOT_FOUND).json({ message: "User not found" });

    await user.destroy();
    return res.status(HTTP.OK).json({ success: true, message: "User removed" });
  } catch (err) {
    console.error("[users/delete]", err);
    return res.status(HTTP.INTERNAL).json({ message: "Server error" });
  }
});

export default router;
