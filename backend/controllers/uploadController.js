const cloudinary = require("../config/cloudinary");
const { STATUS_CODES } = require("../constants");

exports.uploadImage = async (req, res) => {
  try {
    const file = req.file;
    console.log(file);
    if (!file) {
      return res
        .status(STATUS_CODES.BAD_REQUEST)
        .json({ error: req.t("ERROR_MESSAGES.IMAGES.NO_FILE") });
    }

    const uploadResponse = await cloudinary.uploader.upload(file.path, {
      resource_type: "image",
    });

    const optimizedUrl = cloudinary.url(uploadResponse.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    res.status(STATUS_CODES.SUCCESS).send({ url: optimizedUrl });
  } catch (error) {
    console.error(error);
    res
      .status(STATUS_CODES.SERVER_ERROR)
      .json({ error: req.t("ERROR_MESSAGES.IMAGES.UPLOAD") });
  }
};
