<template>
  <div class="music" @contextmenu="handleOpenMenu">
    <div class="music__inner">
      <!-- 歌曲封面 -->
      <div class="music-cover" :class="{ 'is-playing': isPlaying }">
        <div class="music-cover--image">
          <img :src="currentSong?.al.picUrl" v-if="currentSong?.al.picUrl" alt="cover" />
          <div class="not-image" v-else><icon-music /></div>
        </div>
        <div class="music-control-btn" @click="togglePlayStatus" v-if="currentSong">
          <icon-pause v-if="isPlaying" />
          <icon-play-arrow v-else />
        </div>
      </div>
      <!-- 歌曲信息 -->
      <div class="music-info">
        <div class="music-heading">
          <div class="music-next" @click="handleNextSong()">
            <icon-skip-next-fill />
          </div>
          <div class="music-name" :title="currentSong?.name">
            {{ currentSong?.name ?? "暂无歌曲" }}
          </div>
        </div>
        <div class="music-artist">
          <KWalkingText>{{
            currentSong?.artists.map(({ name }) => name).join() ?? "暂无歌手"
          }}</KWalkingText>
        </div>
        <div class="music-volume">
          <div class="music-volume__inner">
            <icon-sound-fill />
            <KSlider :model-value="volume" @update:model-value="handleVolumeChange" :max="1" />
            <div class="volume-text">{{ (volume * 100).toFixed(0) }}%</div>
          </div>
          <MusicDynamic />
        </div>
      </div>
      <!-- 歌词 -->
      <div class="music-lyric">
        <MusicLyric :lyric="currentLyric" :current-time="playInfo.currentTime" />
      </div>
      <!-- 进度条 -->
      <div class="music-progress">
        <div class="music-progress--text">
          {{ formatTime(playInfo.duration) }}
        </div>
        <div class="music-progress--bar">
          <KSlider :model-value="playInfo.currentTime" @update:model-value="handleUpdateCurrentTime"
            :max="playInfo.duration" />
        </div>
        <div class="music-progress--text">
          {{ formatTime(playInfo.currentTime) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentWindow } from "@electron/remote";
import { ref, watch } from "vue";
import { Message } from "@arco-design/web-vue";
import { MsgBody } from "@/utils/danmaku.util";
import IpcRendererUtil from "@/utils/ipc-renderer.util";
import { config } from "@/utils/config";
import {
  isPlaying,
  handleAddSong,
  handleNextSong,
  currentSong,
  currentLyric,
  songList,
  handleCutSong,
} from "./useMusic";
import { Song } from "@/apis/netease.api";
import KSlider from "@/components/k-slider/index.vue";
import MusicLyric from "./components/music-lyric.vue";
import MusicDynamic from "./components/music-dynamic.vue";
import KWalkingText from "@/components/k-walking-text/index.vue";
import { sendNotify } from '@/utils/notify.util';
import { useStorage } from '@vueuse/core';

const playInfo = ref({
  duration: 0,
  currentTime: 0,
});
const volume = ref(Number(localStorage.getItem("volume") || 0.5));
const audio = new Audio();
audio.volume = volume.value;
audio.addEventListener("play", () => {
  console.log(currentSong.value);
  isPlaying.value = true;
});
audio.addEventListener("volumechange", () => {
  volume.value = audio.volume;
});
audio.addEventListener("playing", () => {
  console.log("playing");
});
audio.addEventListener("pause", () => {
  isPlaying.value = false;
});
audio.addEventListener("timeupdate", () => {
  playInfo.value.currentTime = audio.currentTime;
  currentPlay.value.currentTime = audio.currentTime;
});
audio.addEventListener("ended", () => {
  playInfo.value.currentTime = 0;
  playInfo.value.duration = 0;
  currentPlay.value.song = void 0;
  currentPlay.value.currentTime = 0;
  handleNextSong();
});

IpcRendererUtil.on("DANMU_MSG", async (body: MsgBody) => {
  if (body.type === "DANMU_MSG") {
    if (/^(点歌|dg)/i.test(body.msg)) {
      if (config.value.music?.enable) {
        await handleAddSong(body.msg.replace(/^(点歌|dg)/i, ""));
      } else {
        sendNotify({
          type: 'error',
          title: '点歌失败',
          content: '点歌功能暂未开启～'
        })
      }
    } else if (/^切歌/.test(body.msg)) {
      handleCutSong(body.uid);
    } else if (/^(播放列表|歌单)/.test(body.msg)) {
      sendNotify({
        title: '当前播放列表',
        markdown: true,
        content: [
          currentSong.value ? `${currentSong.value.name} - ${currentSong.value.artistsString}（正在播放）` : null,
          ...songList.value.map(s => `${s.name} - ${s.artistsString}`)
        ].filter(Boolean).map((it, i) => `${i + 1}. ${it}`).join('\n'),
        duration: 7000
      })
    }
  }
});

watch(
  () => currentSong.value,
  () => {
    console.log("currentSong change");
    if (currentSong.value) {
      currentPlay.value.song = currentSong.value;
      handlePlayNewSong(currentSong.value);
    } else {
      audio.pause();
    }
  }
);

// handleAddSong("好日子");
const currentPlay = useStorage<{ currentTime?: number; song?: Song }>('CURRENT_PLAY', {});
handleNextSong(currentPlay.value.song);

const handlePlayNewSong = async (song: Song) => {
  try {
    console.log(song);
    audio.src = `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`;
    // 开始播放
    await audio.play();
    audio.currentTime = currentPlay.value.currentTime ?? 0;
    // 保存歌曲时长
    playInfo.value.duration = audio.duration;
    sendNotify({
      title: '播放歌曲',
      content: `开始播放歌曲：${song.name}`
    })
  } catch (e) {
    console.error(e);
    Message.error({
      content: "哦欧，播放失败了，可能是没版权吧～",
      duration: 1500,
    });
    sendNotify({
      type: 'error',
      content: '哦欧，播放失败了，可能是没版权吧～',
    });
    // 播放失败后，播放下一首
    setTimeout(() => {
      handleNextSong();
    }, 2000);
  }
};

const togglePlayStatus = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    audio.play();
  } else {
    audio.pause();
  }
};

const handleUpdateCurrentTime = (value: number) => {
  audio.currentTime = value;
};
const handleVolumeChange = (value: number) => {
  audio.volume = value;
  localStorage.setItem("volume", value.toString());
};

const formatTime = (time: number) => {
  time = Math.round(time);
  const secs = time % 60;
  const mins = (time - secs) / 60;

  return [mins, secs].map((it) => `0${it}`.slice(-2)).join(":");
};

const handleOpenMenu = async () => {
  const res: any = await IpcRendererUtil.send('show-context-menu', {
    menu: [
      { key: 'close', label: '关闭' }
    ]
  });
  if (res?.key === 'close') {
    handleCloseWin();
  }
};

const handleCloseWin = () => {
  getCurrentWindow().close();
};
</script>

<style lang="scss">
.music {
  width: 100%;
  height: 100vh;
  padding-top: 24px;

  .music__inner {
    width: 100%;
    height: 100%;
    padding: 8px 0 16px;
    border-radius: 12px;
    background-color: #fff;
    overflow: hidden;
    -webkit-app-region: drag;
  }

  .music-cover {
    position: absolute;
    left: 12px;
    top: 0;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    transition: all 0.3s;
    -webkit-app-region: no-drag;

    &:hover {
      .music-control-btn {
        font-size: 48px;
        opacity: 1 !important;
      }
    }

    &.is-playing {
      animation: turn 6s linear infinite;

      .music-control-btn {
        opacity: 0;
      }
    }

    @keyframes turn {
      0% {
        transform: rotate(0deg);
      }

      100% {
        transform: rotate(360deg);
      }
    }

    .music-cover--image {
      display: flex;
      background-color: #eee;

      img {
        position: relative;
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
        // filter: blur(1px);
      }

      .not-image {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 32px;
        color: #666;
        background-color: #eee;
      }
    }

    .music-control-btn {
      position: absolute;
      left: 50%;
      top: 50%;
      display: flex;
      transform: translate(-50%, -50%);
      font-size: 42px;
      color: #fff;
      transition: all 0.2s;
      cursor: pointer;
    }
  }

  .music-control {
    display: none;
    padding-left: 120px;

    .music-next {
      font-size: 24px;
    }
  }

  .music-info {
    position: relative;
    display: flex;
    flex-direction: column;
    margin-left: 128px;

    .music-heading {
      display: flex;
      align-items: center;

      .music-name {
        flex: 1;
        font-size: 18px;
        font-weight: bold;
        word-break: keep-all;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .music-next {
        position: relative;
        top: 2px;
        left: -4px;
        width: 0;
        font-size: 32px;
        opacity: 0;
        color: rgb(3, 106, 223);
        transition: all 0.3s;
        cursor: pointer;
      }

      &:hover {
        .music-next {
          width: 28px;
          opacity: 1;
        }
      }
    }

    .music-artist {
      word-break: keep-all;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 12px;
      color: #999;
    }

    .music-volume {
      height: 24px;
      margin-top: 4px;
      margin-left: -24px;

      &:hover {
        .music-dynamic {
          display: none;
        }

        .music-volume__inner {
          display: flex;
          opacity: 1;
        }
      }

      .music-volume__inner {
        display: none;
        align-items: center;
        height: 24px;
        padding-right: 8px;
        opacity: 0;
        transition: all 0.3s;

        .arco-icon {
          margin-right: 4px;
          font-size: 20px;
        }

        .k-slider {
          .k-slider-track {
            --track-height: 4px;
            --btn-width: 8px;
            --btn-height: 8px;
          }
        }

        .volume-text {
          min-width: 36px;
          text-align: right;
          font-size: 12px;
          color: #999;
        }
      }
    }
  }

  .music-dynamic {
    margin-top: 4px;
    margin-left: -24px;
  }

  .music-lyric {
    margin-top: 4px;
    font-size: 14px;
    color: #666;
  }

  .music-progress {
    position: absolute;
    bottom: 4px;
    left: 12px;
    right: 12px;
    -webkit-app-region: no-drag;

    .music-progress--bar {
      width: 100%;
      /* height: 4px; */
      border-radius: 2px;
      /* background-color: rgb(0, 0, 0, 0.2); */

      .music-progress--bar__value {
        height: 100%;
        background-color: rgb(8, 136, 235);
        transition: all 0.2s;
      }
    }

    .music-progress--text {
      // position: absolute;
      font-size: 12px;
      color: rgba(0, 0, 0, 0.4);

      &:first-child {
        text-align: right;
      }
    }
  }
}
</style>
