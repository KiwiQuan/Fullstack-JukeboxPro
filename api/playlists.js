import express from "express";
const router = express.Router();
export default router;

import {
  createPlaylist,
  getPlaylistById,
  getPlaylists,
  getPlaylistsByUserId,
} from "#db/queries/playlists";

import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { getTracksByPlaylistId } from "#db/queries/tracks";

router.use(requireUser);

router
  .route("/")
  .get(async (req, res) => {
    const playlists = await getPlaylistsByUserId(req.user.id);
    res.send(playlists);
  })
  .post(requireBody(["name", "description"]), async (req, res) => {
    const { name, description } = req.body;
    if (!name || !description)
      return res.status(400).send("Request body requires: name, description");

    const playlist = await createPlaylist(name, description, req.user.id);
    res.status(201).send(playlist);
  });

router.param("id", async (req, res, next, id) => {
  const playlist = await getPlaylistById(id);
  if (!playlist) return res.status(404).send("Playlist not found.");

  if (playlist.user_id !== req.user.id)
    return res
      .status(403)
      .send("You are not authorized to view this playlist.");

  req.playlist = playlist;
  next();
});

router.route("/:id").get((req, res) => {
  res.send(req.playlist);
});

router
  .route("/:id/tracks")
  .get(async (req, res) => {
    const tracks = await getTracksByPlaylistId(req.playlist.id);
    res.send(tracks);
  })
  .post(requireBody(["trackId"]), async (req, res) => {
    const { trackId } = req.body;

    const playlistTrack = await createPlaylistTrack(req.playlist.id, trackId);
    res.status(201).send(playlistTrack);
  });
