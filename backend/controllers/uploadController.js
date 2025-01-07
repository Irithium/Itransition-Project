const cloudinary = require("../config/cloudinary");
const { STATUS_CODES } = require("../constants");

exports.uploadImage = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: req.t("ERROR_MESSAGES.IMAGES.NO_FILE") });
    }

    const uploadResponse = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
    });

    console.log(uploadResponse, "SOY UPLOADRESPONSE");

    const optimizedUrl = cloudinary.url(uploadResponse.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });
    console.log(optimizedUrl, "SOY OPTIMIZEDURL");

    res.status(STATUS_CODES.SUCCESS).json({ url: optimizedUrl });
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.IMAGES.UPLOAD") });
  }
};
