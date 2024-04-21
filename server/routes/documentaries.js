const router = require("express").Router();
const Documentary = require("../models/Documentary");
const verify = require("../verifyToken");

//create

router.post("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const newDocumentary = new Documentary(req.body);

    try {
      const savedDocumentary = await newDocumentary.save();
      res.status(200).json(savedDocumentary);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed");
  }
});

//update

router.put("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const newDocumentary = new Documentary(req.body);

    try {
      const updatedDocumentary = await Documentary.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.status(200).json(updatedDocumentary);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed");
  }
});

//delete

router.delete("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    const newDocumentary = new Documentary(req.body);

    try {
      await Documentary.findByIdAndDelete(req.params.id);
      res.status(200).json("The item has been deleted.");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed");
  }
});

//get

router.get("/find/:id", verify, async (req, res) => {
  try {
    const documentary = await Documentary.findById(req.params.id);
    res.status(200).json(documentary);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get random

router.get("/random", verify, async (req, res) => {
  const type = req.query.type;
  let documentary;
  try {
    if (type === "short") {
      documentary = await Documentary.aggregate([
        { $match: { isShort: true } },
        { $sample: { size: 1 } },
      ]);
    } else {
      documentary = await Documentary.aggregate([
        { $match: { isShort: false } },
        { $sample: { size: 1 } },
      ]);
    }
    res.status(200).json(documentary);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all docs

router.get("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const documentaries = await Documentary.find();
      res.status(200).json(documentaries.reverse());
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You are not allowed");
  }
});

module.exports = router;
