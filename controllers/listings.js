const Listing = require("../Models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist.");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newlisting = new Listing(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };

  // ==================== FREE GEOCODING LOGIC (CREATE) ====================
  try {
   // Pehle sirf location + country tha, ab hum ", India" ya "State" ka direct clear format de rhe hain
let locationQuery = encodeURIComponent(`${newlisting.location}, ${newlisting.country}`);
    let response = await fetch(`https://nominatim.openstreetmap.org/search?q=${locationQuery}&format=json&limit=1`, {
      headers: { 'User-Agent': 'WanderLust-College-Project' }
    });
    let data = await response.json();

    if (data && data.length > 0) {
      newlisting.geometry = {
        type: "Point",
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
      };
    } else {
      newlisting.geometry = { type: "Point", coordinates: [77.2090, 28.6139] }; // Fallback Delhi
    }
  } catch (err) {
    console.log("Geocoding Error:", err);
    newlisting.geometry = { type: "Point", coordinates: [77.2090, 28.6139] };
  }
  // =======================================================================

  await newlisting.save();
  req.flash("success", "New listing was created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist.");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  
  // 1. Pehle basic fields update kar lo
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  // ==================== IMPROVED FREE GEOCODING LOGIC (UPDATE) ====================
  try {
    let locationQuery = encodeURIComponent(req.body.listing.location + ", " + req.body.listing.country);
    let response = await fetch(`https://nominatim.openstreetmap.org/search?q=${locationQuery}&format=json&limit=1`, {
      headers: { 'User-Agent': 'WanderLust-College-Project' }
    });
    let data = await response.json();

    if (data && data.length > 0) {
      listing.geometry = {
        type: "Point",
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
      };
    } else if (!listing.geometry || !listing.geometry.type) {
      // Agar API se kuch na mile aur database me pehle se geometry na ho, toh fallback lagao
      listing.geometry = { type: "Point", coordinates: [77.2090, 28.6139] };
    }
  } catch (err) {
    console.log("Geocoding Update Error:", err);
    if (!listing.geometry || !listing.geometry.type) {
      listing.geometry = { type: "Point", coordinates: [77.2090, 28.6139] };
    }
  }
  // =======================================================================

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
  }
  
  await listing.save();
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};