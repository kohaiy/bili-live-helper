import NeteaseApi, { LyricItem, Song } from '@/apis/netease.api';
import { config } from '@/utils/config';
import { ref, computed, watch, h } from 'vue';
import { useStorage } from '@vueuse/core';
import { sendNotify } from '@/utils/notify.util';

// 随机播放 防止连续同一首
const historySongIds: string[] = [];

export const isPlaying = ref(true);
export const currentSong = ref<Song | null>();
export const currentLyric = ref<LyricItem[]>([]);
export const songList = useStorage<Song[]>('SONG_LIST', []);
export const nextSong = computed(() => songList.value[0]);
export const cutSongUid = ref(new Set<number>());

watch(
  () => currentSong.value,
  async (val) => {
    currentLyric.value = [];
    if (val) {
      const lyric = await NeteaseApi.getSongLyric(val.id);
      currentLyric.value = lyric ?? [];
    }
  }
);

export const handleAddSong = async (keyword: string) => {
  const rawSongs = await NeteaseApi.search(keyword);
  if (rawSongs.length) {
    const song = await NeteaseApi.getSongDetail(rawSongs[0].id);
    console.log(song);

    if (song) {
      if (songFilter(song)) {
        // 当前歌曲不为空，则添加进歌单，为空则直接播放
        if (currentSong.value) {
          songList.value.push(song);
        } else {
          currentSong.value = song;
        }
        sendNotify({
          type: 'success',
          title: '点歌成功',
          content: [
            `歌名：${song.name} - ${song.artistsString}`,
            `歌单列表：${songList.value.length} 首`,
          ].join('\n'),
          duration: 5000,
        });
      }
    }
  }
};

export const handleNextSong = async (song?: Song) => {
  cutSongUid.value.clear();
  currentSong.value = song || songList.value.shift();
  if (!currentSong.value) {
    currentSong.value = await getRandomSong();
  }
};

// 切歌
export const handleCutSong = async (uid: number) => {
  if (!config.value.music?.cutLimit) return;
  cutSongUid.value.add(uid);
  if (cutSongUid.value.size >= config.value.music?.cutLimit) {
    handleNextSong();
  }
};

/**
 * 获取随机歌曲
 */
const getRandomSong = async () => {
  // 获取配置信息
  const { defaultListId } = config.value.music || {};
  const list = await NeteaseApi.getHotList(defaultListId);
  let randomId = list[Math.floor(Math.random() * list.length)].id;
  for (let i = 0; i < 10; i++) {
    if (!historySongIds.includes(randomId)) {
      break;
    }
    randomId = list[Math.floor(Math.random() * list.length)].id;
  }
  historySongIds.unshift(randomId);
  historySongIds.length = 10;

  return NeteaseApi.getSongDetail(randomId);
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
