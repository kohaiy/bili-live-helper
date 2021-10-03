import NeteaseApi, { Song } from "@/apis/netease.api";
import { config } from "@/utils/config";
import { ref } from "vue";

export const isPlaying = ref(true);
export const currentSong = ref<Song | null>();
export const songList = ref<Song[]>([]);

export const handleAddSong = async (keyword: string) => {
  const rawSong = await NeteaseApi.search(keyword);
  if (rawSong) {
    const song = await NeteaseApi.getSongDetail(rawSong.id);
    if (song) {
      if (songFilter(song)) {
        // 当前歌曲不为空，则添加进歌单，为空则直接播放
        if (currentSong.value) {
          songList.value.push(song);
        } else {
          currentSong.value = song;
        }
      }
    }
  }
};

const songFilter = (song: Song) => {
  // 歌曲列表上限
  if (songList.value.length >= (config.value.music?.listLimit || 10)) {
    return false;
  }
  // 歌曲黑名单
  if ((config.value.music?.blackList || []).some(({ id }) => id === song.id)) {
    return false;
  }
  return true;
};
