import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {

    const notifications = await Notification
      .find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      notifications,
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export const clearNotification = async (req, res) => {
  try {

    await Notification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Notification removed",
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};