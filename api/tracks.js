import express from "express";
const tracksRouter = express.Router();
export default tracksRouter;
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";

import {
  getTracks,
  getTrackById,
  getPlaylistsByTrackId,
} from "#db/queries/tracks";

tracksRouter.use(requireUser);

tracksRouter.route("/").get(async (req, res) => {
  const tracks = await getTracks();
  res.send(tracks);
});

tracksRouter.route("/:id").get(async (req, res) => {
  const track = await getTrackById(req.params.id);
  if (!track) return res.status(404).send("Track not found.");
  res.send(track);
});

tracksRouter.route("/:id/playlists").get(async (req, res) => {
  if (!req.params.id) return res.status(400).send("Track id required.");
  const playlists = await getPlaylistsByTrackId(req.params.id);
  res.send(playlists);
});
