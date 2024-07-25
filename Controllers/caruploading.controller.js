const allCar = require('../Modals/car.modal')
const cloudinary = require('cloudinary')
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const multer = require('multer');
const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
const upload = multer({ dest: 'uploads/' });


const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
  };

  const saveCarImg= async(req, res)=>{
    // console.log(req.body);
    try {
      const imageUrl = await uploadToCloudinary(req.file.path);
      console.log('Image URL:', imageUrl);
  
      if(imageUrl){
        res.send({msg:"Image uploaded", status:true, imageUrl})
      }else{
        res.send({msg:"Image not uploaded", status:false})
      }
    } catch (error) {
      console.log(error);
    }
  }
  const registerCar = async (req, res) => {
    console.log(req.body);
    try {
      const { image, name, plateNum, color, location, owner } = req.body;
      const newCar = new allCar({
        image,
        name,
        plateNum,
        color,
        location,
        owner,
      });
  
      let saveCar = await newCar.save();
      if (saveCar){
        res.status(201).json({ message: 'Car registered successfully', status:true });
      }else{
        res.status(201).json({ message: 'Car registered not save', car: newCar });
      }
    } catch (error) {
      console.error('Error registering car:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  const userCars= async(req, res)=>{
    // console.log(req.body);
    const {user} = req.body
    let myCar= await allCar.find({owner:user})
    console.log(myCar);

    res.send({status:myCar.length>0?true:false, myCar})
  }
module.exports = { registerCar, saveCarImg, userCars };
                                                                                                                                  