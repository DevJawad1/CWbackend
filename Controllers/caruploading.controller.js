const allCar = require('../Modals/car.modal')
const cloudinary = require('cloudinary')
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});


const duplicateAndSaveToCloudinary=async(uploadedfile)=>{
    try {
        // Upload the original image to Cloudinary
        const originalResult = await cloudinary.uploader.upload(uploadedfile);
    
        // Generate a unique public ID for the duplicate image  
        const duplicatePublicId = `${originalResult.public_id}_duplicate`;
    
        // Upload the duplicate image to Cloudinary
        const duplicateResult = await cloudinary.uploader.upload(uploadedfile, {
          public_id: duplicatePublicId
        });
    
        return {
          originalImageUrl: originalResult.secure_url,
          duplicateImageUrl: duplicateResult.secure_url
        };
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
}

const uploadToCloudinary = async (uploadedFile) => {
    try {
      const result = await cloudinary.uploader.upload(uploadedFile);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };
  const registerCar = async (req, res) => {
    console.log(req.body);
    try {
      const { image, name, plateNum, color, location, owner } = req.body;
      const imageUrl = await uploadToCloudinary(image);
      console.log('Image URL:', imageUrl);
      const newCar = new allCar({
        name,
        plateNum,
        color,
        location,
        owner,
        imageUrl,
      });
  
      let saveCar = await newCar.save();
      res.status(201).json({ message: 'Car registered successfully', car: newCar });
    } catch (error) {
      console.error('Error registering car:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
module.exports = { registerCar };
                                                                                                                                  