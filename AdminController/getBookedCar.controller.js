const bookcarDB = require('../Modals/bookcar.modal');
const userDB = require('../Modals/register.modal');

const allBookedCar = async (req, res) => {
    try {
        // Fetch all bookings
        const allBooking = await bookcarDB.find({});

        // Map over all bookings and fetch user data for each booking
        const newBooking = await Promise.all(allBooking.map(async (item) => {
            const user = await userDB.findOne({ _id: item.owner });

            // Return a new object for each booking with owner details
            return {
                carId: item.carId,
                owner: user.firstName + " " + user.lastName,
                location: item.location,
                picked: false,
                delivered: false,
                type: user.type
            };
        }));

        // Get the number of unique car owners
        const allBookedCarOwners = new Set(allBooking.map(car => car.owner));

        // Send the response
        res.send({ allBooker: allBookedCarOwners.size, allBooking: newBooking });
    } catch (error) {
        // Handle any errors that might occur
        res.status(500).send({ error: 'An error occurred while fetching bookings.' });
    }
};

module.exports = { allBookedCar };
