try {
  importScripts(['util.js']);
} catch {
}

const show_debug = false;  // this is very loud

// post messages for follows, recent_videos, and recent_videos_progress
// this may be a long running process, so send progress updates
// - fetch follows and post back
// - fetch 10 videos for each follow and keep the 50 most recent videos
// - keep track of follow_i and send progress
// util.recent_videos_progress_segments messages
addEventListener('message', async (d) => {
  if (show_debug) console.log('worker received message', d.data)
    const {base_url, user_id, limit} = d.data;
  let all_follows = await useApi(
      `${base_url}/users/${user_id}/follows/channels?limit=${limit}&offset=0`);
  let follows = all_follows;
  if (show_debug) console.log('follows ', follows);
  postMessage({message_type: 'follows', follows});

  // fetch remaining follows
  // FIXME offset is currently ignored. so this only duplicates first 100
  //  - curently doing nothing
  let n = follows.follows.length;
  for (; n < follows._total; n += follows.follows.length) {
    break;
    follows = await useApi(`${base_url}/users/${
        user_id}/follows/channels?limit=${limit}&offset=${n}`);

    postMessage({message_type: 'follows', follows})
    all_follows.follows += follows.follows;
  }
  if (show_debug)
    console.log('done fetching follows. length ', all_follows.follows.length);

  let recent_videos = [];
  const max_recent_videos = 50;

  // 'recent_videos_progress_segments' is defined in util.js
  const recent_videos_progress_interval =
      Math.floor(all_follows.follows.length / recent_videos_progress_segments);
  if (show_debug) {
    console.log(`recent_videos_progress interval ${
        recent_videos_progress_interval} length
      ${all_follows.follows.length}`);
  }

  // insert into recent_videos
  let follow_i = 0;
  for (const follow of all_follows.follows) {
    let videos =
        await useApi(`${base_url}/channels/${follow.channel._id}/videos?limit=${
            10}&broadcast_type=archive&sort=time`);
    if (show_debug) console.log('videos length ', videos.videos.length);

    for (const video of videos.videos) {
      let date = new Date(video.created_at);
      let index = indexFor(
          {date, video}, recent_videos,
          (b, a) => numberCompare(
              a.date ? a.date.valueOf() : 0, b.date ? b.date.valueOf() : 0));
      if (recent_videos.length < max_recent_videos) {
        recent_videos.splice(index + 1, 0, {date, video});
      } else if (index < max_recent_videos) {
        recent_videos.pop();
        recent_videos.splice(index + 1, 0, {date, video});
      } else {
        if (show_debug) console.log('too old')
      }

      if (show_debug) {
        console.log(
            'index ', index, ' recent_videos length ', recent_videos.length);
      }

      // send progress messages
      if ((follow_i % recent_videos_progress_interval) === 0) {
        postMessage({
          message_type: 'recent_videos_progress',
          recent_videos_progress:
              Math.floor(follow_i / recent_videos_progress_interval) + 1,
        });
      }
    }
    follow_i += 1;
  }
  if (show_debug) {
    for (video of recent_videos) {
      console.log(video.date)
    }
  }
  postMessage({message_type: 'recent_videos', recent_videos});
});

// helix api wip
// addEventListener('message', async (d) => {
//   console.log('worker received message', d.data)
//   const {base_url, user_id, limit} = d.data;
//   let follows = await
//   useApi(`${base_url}/users/follows/?from_id=${user_id}`);
//   console.log('follows ', follows);
//   postMessage(follows)
//   let n = follows.follows.length;
//   for (; n < follows._total; n += follows.follows.length) {
//     follows = await useApi(`${base_url}/users/follows/?from_id=${user_id}`);
//   }
// });