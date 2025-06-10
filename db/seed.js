import db from "#db/client";

import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";
import { createUser } from "#db/queries/users";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  const user1 = await createUser("joe@joepassword", "joe123");
  const user2 = await createUser("bob@bobpassword", "bob123");

  const playlist1 = await createPlaylist(
    "Playlist 1",
    "playlist for user 1",
    user1.id
  );
  const playlist2 = await createPlaylist(
    "Playlist 2",
    "playlist for user 2",
    user2.id
  );

  for (let i = 1; i <= 2; i++) {
    const playlistId = i === 1 ? playlist1.id : playlist2.id;
    for (let j = 1; j <= 10; j++) {
      await createTrack("Track " + j, j * 50000);
      try {
        await createPlaylistTrack(playlistId, j);
      } catch (err) {
        if (err.code === "23505") {
          // duplicate key error, skip
          j--; // retry this iteration
        } else {
          throw err;
        }
      }
    }
  }
}
