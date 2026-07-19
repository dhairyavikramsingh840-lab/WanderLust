const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../Models/listing.js");
const { isLoggedIn, isOwner, validatelisting } = require("../middleware.js");
const listingControllers = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// 1. INDEX AND CREATE ROUTE

router
  .route("/")
  .get(wrapAsync(listingControllers.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validatelisting,
    wrapAsync(listingControllers.createListing),
  );

// 2. NEW ROUTE
router.get("/new", isLoggedIn, listingControllers.renderNewForm);

// 3. SHOW , UPDATE AND DELETE ROUTE
router
  .route("/:id")
  .get(wrapAsync(listingControllers.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validatelisting,
    wrapAsync(listingControllers.updateListing),
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingControllers.destroyListing));

// 4. EDIT ROUTE
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingControllers.renderEditForm),
);

module.exports = router;
