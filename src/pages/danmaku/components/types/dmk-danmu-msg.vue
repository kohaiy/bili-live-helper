<template>
  <div class="dmk-danmu-msg">
    <div class="msg-medal" v-if="data.fansMedal?.level" :style="{
      borderColor: mapColor(data.fansMedal.borderColor),
    }">
      <div class="fans-medal-label" :style="{
        backgroundImage: `linear-gradient(45deg, ${mapColor(data.fansMedal.bgStartColor)}, ${mapColor(data.fansMedal.bgEndColor)})`
      }">{{ data.fansMedal.name }}</div>
      <div class="fans-medal-level" :style="{
        color: mapColor(data.fansMedal.color)
      }">{{ data.fansMedal.level }}</div>
    </div>
    <div class="msg-nickname" :class="{ admin: data.isAdmin }">{{ data.uname }}:</div>
    <div class="msg-emoticon" v-if="data.emoticon">
      <img :src="data.emoticon.url" alt="">
    </div>
    <div class="msg-text" v-else-if="data.emotes">
      <DanmakuRichMsg :msg="data.msg" :emotes="data.emotes" />
    </div>
    <div class="msg-text" v-else>{{ data.msg }}</div>
  </div>
</template>

<script lang="ts" setup>
import { MsgBody } from '@/utils/danmaku.util';
import DanmakuRichMsg from '../danmaku-rich-msg.vue';

defineProps<{
  data: MsgBody;
}>();

const mapColor = (color: number) => `#${`00${color.toString(16)}`.slice(-6)}`

</script>

<style lang="scss" scoped>
.dmk-danmu-msg {
  .msg-medal {
    display: inline-flex;
    margin-right: 4px;
    background-color: #ffffff;
    overflow: hidden;
    box-sizing: content-box;
    height: 14px;
    line-height: 14px;
    color: #fff;
    border: 1px solid #000000;
    white-space: nowrap;
    border-radius: 2px;
    font-size: 12px;
    position: relative;
    cursor: default;

    .fans-medal-label {
      display: inline-block;
      vertical-align: middle;
      min-width: 12px;
      padding: 0 4px;
      color: #fff;
      box-sizing: content-box;
      height: 100%;
      text-align: center;
    }

    .fans-medal-level {
      display: inline-block;
      vertical-align: middle;
      width: 16px;
      background-color: #fff;
      text-align: center;
      border-top-left-radius: 1px;
      border-bottom-right-radius: 1px;
      box-sizing: content-box;
      height: 100%;
      color: #000000;
    }
  }

  .msg-nickname {
    display: inline-block;
    margin-right: 4px;
    font-size: 12px;
    color: #39b0f1;

    &.admin::before {
      content: '房';
      margin-right: 4px;
      padding: 0 2px;
      border-radius: 2px;
      border: 1px solid #fea249;
      font-size: 12px;
      color: #fea249;
    }
  }

  .msg-text {
    display: inline;
    font-size: 12px;
    color: #cccccc;
  }

  .msg-emoticon {
    position: relative;
    top: 4px;
    margin-top: -4px;
    display: inline-flex;

    img {
      max-width: 60px;
      max-height: 40px;
    }
  }

}
</style>
