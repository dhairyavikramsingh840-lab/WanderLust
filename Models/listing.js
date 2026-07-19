const mongoose = require("mongoose");
let Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  // ==================== CATEGORY FIELD ADDED ====================
  category: {
    type: String,
    enum: ["Trending", "Rooms", "Iconic Cities", "Mountains", "Castles", "Amazing Pools", "Camping", "Farms", "Arctic", "Dome", "Boats"],
    default: "Trending"
  },
  // ==============================================================
  // ==================== GEOMETRY FIELD ADDED ====================
  geometry: {
    type: {
      type: String, 
      enum: ['Point'], // GeoJSON type 'Point' hi hona chahiye
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude] array
      required: true
    }
  }
  // ==============================================================
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;