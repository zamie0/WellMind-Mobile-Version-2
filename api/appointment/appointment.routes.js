import express from "express";
import {
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
} from "./appointment.controller.js";

const router = express.Router();

router.get("/", listAppointments);
router.post("/", createAppointment);
router.patch("/:appointmentId/status", updateAppointmentStatus);

export default router;
