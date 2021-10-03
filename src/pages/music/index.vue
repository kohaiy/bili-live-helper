<template>
  <div class="music">
    <div class="music__inner">
      <div class="music-cover" :class="{ 'is-playing': isPlaying }">
        <div class="music-cover--image">
          <img :src="currentSong?.al.picUrl" alt="cover" />
        </div>
        <div class="music-control-btn" @click="togglePlayStatus">
          <el-icon :size="40">
            <video-play v-if="isPlaying" />
            <video-pause v-else />
          </el-icon>
        </div>
      </div>
      <div v-if="currentSong">{{ currentSong.name }}</div>
      <div class="music-progress">
        <div class="music-progress--text">{{ formatTime(playInfo.duration) }}</div>
        <div class="music-progress--bar">
          <div class="music-progress--bar__value" :style="{ width: `${playInfo.currentTime / playInfo.duration * 100}%` }"></div>
          <!-- <el-slider v-model="progress" :show-tooltip="false"></el-slider> -->
        </div>
        <div class="music-progress--text">{{ formatTime(playInfo.currentTime) }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { VideoPlay, VideoPause } from '@element-plus/icons';
import { ElMessage } from 'element-plus';
import { MsgBody } from '@/utils/danmaku.util';
import IpcRendererUtil from '@/utils/ipc-renderer.util';
import { isPlaying, handleAddSong, currentSong } from './useMusic';
import { Song } from '@/apis/netease.api';

const playInfo = ref({
  duration: 0,
  currentTime: 0
});
const audio = new Audio();
audio.volume = 0.1;
audio.addEventListener('play', () => {
  console.log('play');
});
audio.addEventListener('playing', () => {
  console.log('playing');
});
audio.addEventListener('timeupdate', () => {
  playInfo.value.currentTime = audio.currentTime;
});

IpcRendererUtil.on('DANMU_MSG', (body: MsgBody) => {
  if (body.type === 'DANMU_MSG') {
    if (/^点歌/.test(body.msg)) {
      console.log(body.msg);
      handleAddSong(body.msg.replace(/^点歌/, ''));
    }
  }
});

// const progress = ref(0);
watch(() => currentSong.value, () => {
  console.log('currentSong change');
  if (currentSong.value) {
    handlePlayNewSong(currentSong.value)
  }
});

handleAddSong('好日子');

const handlePlayNewSong = async (song: Song) => {
  try {
    console.log(song);
    audio.src = `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`;
    // 开始播放
    await audio.play();
    // 保存歌曲时长
    playInfo.value.duration = audio.duration;
  } catch (e) {
    console.error(e);
    ElMessage({
      type: 'error',
      message: '哦欧，播放失败了，可能是没版权吧～',
      duration: 1500,
    });
    // 播放失败后，播放下一首
    // setTimeout(() => {
    //   this.play();
    // });
  }

}

const togglePlayStatus = () => {
  isPlaying.value = !isPlaying.value;
  if (isPlaying.value) {
    audio.play();
  } else {
    audio.pause();
  }
};

const formatTime = (time: number) => {
  time = Math.round(time);
  const secs = time % 60;
  const mins = (time - secs) / 60;

  return [mins, secs].map(it => `0${it}`.slice(-2)).join(':');
}

</script>

<style lang="scss" scoped>
.music {
  width: 100%;
  height: 100vh;
  padding-top: 24px;

  .music__inner {
    width: 100%;
    height: 100%;
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

    &:hover {
      .music-control-btn {
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

      img {
        position: relative;
        width: 100%;
        height: 100%;
        object-fit: cover;
        // filter: blur(1px);
      }
    }
    .music-control-btn {
      position: absolute;
      left: 50%;
      top: 50%;
      display: flex;
      transform: translate(-50%, -50%);
      color: #fff;
      transition: all 0.2s;
      cursor: pointer;
    }
  }

  .music-progress {
    position: absolute;
    bottom: 4px;
    left: 12px;
    right: 12px;
    -webkit-app-region: no-drag;

    .music-progress--bar {
      width: 100%;
      height: 4px;
      border-radius: 2px;
      overflow: hidden;
      background-color: rgb(0, 0, 0, .2);

      .music-progress--bar__value {
        height: 100%;
        background-color: rgb(8, 136, 235);
        transition: all .2s;
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